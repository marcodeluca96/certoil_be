import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Ed25519KeypairSigner } from "@iota/iota-interaction-ts/node/test_utils";
import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { getFaucetHost, requestIotaFromFaucetV0 } from "@iota/iota-sdk/faucet";
import { decodeIotaPrivateKey } from "@iota/iota-sdk/cryptography";
import dotenv from "dotenv";
import { CONSTS } from "../utils/env";

dotenv.config();

export class WalletService {
    private keypair: Ed25519Keypair;
    private signer: Ed25519KeypairSigner;
    private iotaClient: IotaClient;

    constructor() {
        const privateKey = CONSTS.PRIVATE_KEY;

        if (privateKey) {
            try {
                console.log("🔑 Processing private key from environment...");

                // Check if it's a bech32 key (starts with iotaprivkey1)
                if (privateKey.startsWith('iotaprivkey1')) {
                    console.log("🔄 Using IOTA SDK's bech32 key decoder...");

                    // Use IOTA SDK's built-in decoder for bech32 keys
                    const { schema, secretKey } = decodeIotaPrivateKey(privateKey);

                    console.log(`🔑 Key details: Schema=${schema}, Secret key length=${secretKey.length} bytes`);

                    if (schema !== 'ED25519') {
                        throw new Error(`Unsupported key schema: ${schema}. Only ED25519 is supported.`);
                    }

                    if (secretKey.length !== 32) {
                        throw new Error(`Invalid secret key length: ${secretKey.length} bytes. Expected 32 bytes.`);
                    }

                    this.keypair = Ed25519Keypair.fromSecretKey(secretKey);
                    console.log("✅ Successfully loaded bech32 private key");
                } else {
                    console.log("🔑 Using base64 private key directly...");
                    const privateKeyBytes = Buffer.from(privateKey, 'base64');

                    if (privateKeyBytes.length !== 32) {
                        throw new Error(`Invalid base64 key length: ${privateKeyBytes.length} bytes. Expected 32 bytes.`);
                    }

                    this.keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
                    console.log("✅ Successfully loaded base64 private key");
                }

                console.log(`✅ Using existing wallet: ${this.getAddress()}`);

            } catch (error) {
                console.error("❌ Invalid private key in environment:", error);
                console.log("🔄 Generating new keypair...");
                this.keypair = this.generateNewKeypair();
            }
        } else {
            console.log("🔑 No private key found, generating new keypair...");
            this.keypair = this.generateNewKeypair();
        }

        this.signer = new Ed25519KeypairSigner(this.keypair);
        this.iotaClient = new IotaClient({
            url: process.env.NETWORK_URL || getFullnodeUrl(CONSTS.IOTA_NET)
        });

        console.log(`✅ Wallet initialized for address: ${this.getAddress()}`);
    }

    private generateNewKeypair(): Ed25519Keypair {
        const keypair = Ed25519Keypair.generate();
        const bech32PrivateKey = keypair.getSecretKey();

        console.log("🔑 Generated NEW keypair - SAVE THESE FOR PRODUCTION:");
        console.log("Private Key (bech32):", bech32PrivateKey);

        try {
            const { secretKey } = decodeIotaPrivateKey(bech32PrivateKey);
            console.log("Private Key (base64 - 32 bytes):", Buffer.from(secretKey).toString('base64'));
        } catch (error) {
            console.log("Private Key (base64): [Conversion failed]");
        }

        console.log("Public Key:", keypair.getPublicKey().toBase64());
        console.log("Address:", keypair.toIotaAddress());
        console.log("⚠️  Add PRIVATE_KEY to your .env file for production use!");
        console.log("   Recommended: Use the bech32 format above");

        return keypair;
    }

    getKeypair(): Ed25519Keypair {
        return this.keypair;
    }

    getSigner(): Ed25519KeypairSigner {
        return this.signer;
    }

    getIotaClient(): IotaClient {
        return this.iotaClient;
    }

    getAddress(): string {
        return this.keypair.toIotaAddress();
    }

    async ensureFunds(): Promise<void> {
        try {
            const balance = await this.iotaClient.getBalance({
                owner: this.getAddress(),
            });

            if (balance.totalBalance === "0") {
                console.log("💰 Requesting faucet funds...");
                await requestIotaFromFaucetV0({
                    host: getFaucetHost(CONSTS.IOTA_NET),
                    recipient: this.getAddress(),
                });

                // Wait for funds to be available
                console.log("⏳ Waiting for faucet transaction...");
                await new Promise(resolve => setTimeout(resolve, 5000));

                const newBalance = await this.iotaClient.getBalance({
                    owner: this.getAddress(),
                });
                console.log(`✅ Received ${newBalance.totalBalance} IOTA tokens`);
            } else {
                console.log(`✅ Wallet balance: ${balance.totalBalance} IOTA`);
            }
        } catch (error) {
            console.error("❌ Error ensuring funds:", error);
            throw error;
        }
    }

    async getBalance(): Promise<string> {
        const balance = await this.iotaClient.getBalance({
            owner: this.getAddress(),
        });
        return balance.totalBalance;
    }

    getPrivateKeyBase64(): string {
        try {
            const { secretKey } = decodeIotaPrivateKey(this.keypair.getSecretKey());
            return Buffer.from(secretKey).toString('base64');
        } catch (error) {
            console.error("Failed to convert private key to base64:", error);
            throw error;
        }
    }

    getPrivateKeyBech32(): string {
        return this.keypair.getSecretKey();
    }
}
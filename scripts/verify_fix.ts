import { NotarizationService } from "../src/services/notarizationService";

async function main() {
    console.log("Starting verification...");
    const service = new NotarizationService();
    try {
        // We call verifyNotarization which internally uses getReadOnly -> ensureInitialized
        // We use a dummy ID and hash. This should likely fail due to invalid ID or not found,
        // BUT it should NOT fail with "Notarization client not initialized".
        console.log("Calling verifyNotarization...");
        // Providing a potentially valid formatted ID to avoid instant regex failure if any
        // Assuming ID is hex string, let's use a 64-char hex string just in case
        const dummyId = "0x" + "0".repeat(62);
        const dummyHash = "a".repeat(64);

        const result = await service.verifyNotarization(dummyId, dummyHash);
        console.log("Result:", result);

        if (result.error && result.error.includes("Notarization client not initialized")) {
            console.error("FAIL: Client still not initialized!");
            process.exit(1);
        }
    } catch (e: any) {
        console.log("Caught error:", e.message);
        if (e.message.includes("Notarization client not initialized")) {
            console.error("FAIL: Client still not initialized!");
            process.exit(1);
        }
    }
    console.log("SUCCESS: Client initialized check passed");
}

main().catch(console.error);

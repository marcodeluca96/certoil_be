import { createHash } from 'crypto';

export class CryptoUtils {
    /**
     * Compute SHA-256 hash of a file buffer or string
     */
    static computeSHA256(data: Buffer | string): string {
        const hash = createHash('sha256');

        if (Buffer.isBuffer(data)) {
            hash.update(data);
        } else {
            hash.update(data, 'utf8');
        }

        return hash.digest('hex');
    }

    /**
     * Compute file hash from Buffer (for uploaded files)
     */
    static computeFileHash(fileBuffer: Buffer): string {
        return this.computeSHA256(fileBuffer);
    }

    /**
     * Validate if a string is a valid SHA-256 hash
     */
    static isValidSHA256Hash(hash: string): boolean {
        return /^[a-f0-9]{64}$/i.test(hash);
    }
}
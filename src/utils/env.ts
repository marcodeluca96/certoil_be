import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export const CONSTS = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    IOTA_NOTARIZATION_PKG_ID: process.env.IOTA_NOTARIZATION_PKG_ID || '',
    NETWORK_URL: process.env.NETWORK_URL || '',
    PRIVATE_KEY: process.env.PRIVATE_KEY || '',
    IOTA_NET: process.env.IOTA_NET || 'localnet',
    UPLOAD_DOC_PATH: process.env.UPLOAD_DOC_PATH || './uploads',
}
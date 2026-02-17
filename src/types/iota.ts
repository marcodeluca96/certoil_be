export interface IotaLockedResponse {
    success: boolean;
    notarizationId: string;
    transactionDigest: string;
    type: string;
    timestamp: string;
}

export interface GetNotarizationResponse {
    success: boolean;
    notarizationId: string;
    state: {
        content: string;
        metadata: string
    },
    versionCount: number,
    description: string,
    createdAt: string,
    method: string,
    locks: {
        transferLocked: boolean,
        updateLocked: boolean,
        destroyAllowed: boolean
    }
}


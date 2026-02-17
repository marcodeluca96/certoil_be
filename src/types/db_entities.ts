export interface Company {
    id: number;
    company_name: string;
    address: string;
    zip_code: string;
    city: string;
    province: string;
    vat_number: string;
    tax_code: string;
    email: string;
    certified_email?: string | null;
    phone_number?: string | null;
    website?: string | null;
    created_at?: Date;
    updated_at?: Date;
}

export interface Certification {
    id: number;
    company_id: number;
    code: string;
    expiry_date: Date;
    note?: string | null;
    created_at?: Date;
    updated_at?: Date;
}

export interface Document {
    id: number;
    company_id: number;
    certification_id: number;
    document_name: string;
    document_path: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface OilData {
    id: number;
    company_id: number;
    certification_id: number;
    name: string;
    value: string;
    unit: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface IotaCertification {
    id: number;
    certification_id: number;
    transactionDigest?: string | null;
    notarizationId?: string | null;
    note?: string | null;
    created_at?: Date;
    updated_at?: Date;
}

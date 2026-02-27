export interface SubmitCertificationRequest {
  oilData: OilDataDTO[];
  companyData: CompanyDTO;
  document: File;
  certificationExpireDate: string;
  certificationNote?: string | null;
}

export interface OilDataDTO {
  name: string;
  value: any;
  unit: string;
}

export interface CompanyDTO {
  companyName: string;
  address: string;
  zipCode: string;
  city: string;
  province: string;
  vatNumber: string;
  taxCode: string;
  email: string;
  certifiedEmail?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
}

export interface CertificationSearchDTO {
  companyId: number;
  companyName: string;
  oilData: { formattedValue: string; data: OilDataDTO }[];
  certificationId: number;
  certificationCode: string;
  certificationCreatedAt: string;
  certificatePath: string;
  notarizationId: string;
}

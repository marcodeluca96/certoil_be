import { NotarizationService } from "./notarizationService";
import { CompanyService } from "./companyService";
import { DocumentService } from "./documentService";
import { CompanyDTO, OilDataDTO } from "../types/models";
import { isExpired, isValidISODate } from "../utils/DateUtils";

export class CertificationService {
  private notarizationService: NotarizationService;
  private companyService: CompanyService;
  private documentService: DocumentService;

  constructor() {
    this.notarizationService = new NotarizationService();
    this.companyService = new CompanyService();
    this.documentService = new DocumentService();
  }

  /**
   * Create a new certification
   * @param companyData
   * @param certificationExpireDate
   * @param certificationNote
   * @param oilData
   * @returns { success: boolean; message: string | null }
   */
  async createCertification(
    companyData: string,
    certificationExpireDate: string,
    certificationNote: string | null,
    oilData: string,
  ): Promise<{ success: boolean; message: string | null }> {
    const {
      success,
      message,
      companyData: companyDataParsed,
      oilData: oilDataParsed,
    } = this.checkMissingFields(companyData, certificationExpireDate, certificationNote, oilData);
    if (!success) {
      return {
        success: false,
        message: message,
      };
    }

    const company = await this.companyService.createCompany(companyDataParsed!);
    if (!company.success) {
      return {
        success: false,
        message: company.message,
      };
    }
    return {
      success: true,
      message: "Certification created successfully",
    };
  }

  /**
   * Check if the required fields are present in the request
   * @param companyData
   * @param certificationExpireDate
   * @param certificationNote
   * @param oilData
   * @returns { success: boolean; message: string | null }
   */
  private checkMissingFields(
    companyData: string,
    certificationExpireDate: string,
    certificationNote: string | null,
    oilData: string,
  ): {
    success: boolean;
    message: string | null;
    companyData?: CompanyDTO;
    oilData?: OilDataDTO[];
  } {
    let missingFields = [];
    if (!companyData) missingFields.push("companyData");
    if (!certificationExpireDate) missingFields.push("certificationExpireDate");
    if (!oilData) missingFields.push("oilData");

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing fields: ${missingFields.join(", ")}`,
      };
    }

    const companyDataParsed = JSON.parse(companyData) as CompanyDTO;
    const oilDataParsed = JSON.parse(oilData) as OilDataDTO[];
    if (companyDataParsed) {
      if (!companyDataParsed.companyName) missingFields.push("companyData.companyName");
      if (!companyDataParsed.address) missingFields.push("companyData.address");
      if (!companyDataParsed.city) missingFields.push("companyData.city");
      if (!companyDataParsed.province) missingFields.push("companyData.province");
      if (!companyDataParsed.zipCode) missingFields.push("companyData.zipCode");
      if (!companyDataParsed.email) missingFields.push("companyData.email");
      if (!companyDataParsed.taxCode) missingFields.push("companyData.taxCode");
      if (!companyDataParsed.vatNumber) missingFields.push("companyData.vatNumber");
    }
    if (certificationExpireDate) {
      if (!isValidISODate(certificationExpireDate))
        missingFields.push("certificationExpireDate is not a valid ISO date");
      if (isExpired(certificationExpireDate))
        missingFields.push("certificationExpireDate is expired. Must be in the future");
    }
    if (oilDataParsed) {
      if (oilDataParsed.length === 0) missingFields.push("oilData is empty");
      oilDataParsed.forEach((oil) => {
        if (!oil.name || oil.name.trim() === "") missingFields.push("oilData.name");
        if (!oil.value || oil.value.trim() === "") missingFields.push("oilData.value");
        if (!oil.unit || oil.unit.trim() === "") missingFields.push("oilData.unit");
      });
    }
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing fields: ${missingFields.join(", ")}`,
      };
    }
    return {
      success: true,
      message: null,
      companyData: companyDataParsed,
      oilData: oilDataParsed,
    };
  }
}

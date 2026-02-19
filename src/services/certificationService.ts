import { NotarizationService } from "./notarizationService";
import { CompanyService } from "./companyService";
import { DocumentService } from "./documentService";
import { pool } from "../db/connection";
import { CompanyDTO, OilDataDTO } from "../types/models";
import { isExpired, isValidISODate, isoToMilliseconds, isoToMySQLDate } from "../utils/DateUtils";
import { generateSafeUniqueCode } from "../utils/generateCodeUtils";
import { OilDataService } from "./oilDataService";
import { RowDataPacket } from "mysql2";
import { CryptoUtils } from "../utils/crypto";

export class CertificationService {
  private notarizationService: NotarizationService;
  private companyService: CompanyService;
  private documentService: DocumentService;
  private oilDataService: OilDataService;

  constructor() {
    this.notarizationService = new NotarizationService();
    this.companyService = new CompanyService();
    this.documentService = new DocumentService();
    this.oilDataService = new OilDataService();
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
    document: Express.Multer.File,
  ): Promise<{ success: boolean; message: string | null; data?: { notarizationId: string } }> {
    const {
      success,
      message,
      companyData: companyDataParsed,
      oilData: oilDataParsed,
    } = this.checkMissingFields(companyData, certificationExpireDate, oilData);
    if (!success) {
      return {
        success: false,
        message: message,
      };
    }
    const connection = await pool.getConnection();

    const companyResult = await this.companyService.createCompany(
      companyDataParsed!,
      connection as any,
    );
    if (!companyResult.success || !companyResult.companyId) {
      return {
        success: false,
        message: companyResult.message,
      };
    }
    const companyId = companyResult.companyId;

    try {
      await connection.beginTransaction();

      const certificationCode = await generateSafeUniqueCode(async (code) => {
        const [rows] = await connection.query<RowDataPacket[]>(
          "SELECT code FROM certifications WHERE code = ? LIMIT 1",
          [code],
        );
        return rows.length > 0;
      });
      const expiryDateMySQL = isoToMySQLDate(certificationExpireDate);

      const [certResult] = await connection.execute(
        `INSERT INTO certifications (company_id, code, expiry_date, note) 
         VALUES (?, ?, ?, ?)`,
        [companyId, certificationCode, expiryDateMySQL, certificationNote || null],
      );

      const certificationId = (certResult as any).insertId;

      const docResult = await this.documentService.saveDocument(
        companyId,
        certificationId,
        document,
        connection as any,
      );

      if (!docResult.success) {
        return {
          success: false,
          message: docResult.message,
        };
      }

      // Save Oil Data
      if (oilDataParsed && oilDataParsed.length > 0) {
        const oilResult = await this.oilDataService.saveOilData(
          companyId,
          certificationId,
          oilDataParsed,
          connection as any,
        );

        if (!oilResult.success) {
          return {
            success: false,
            message: oilResult.message,
          };
        }
      }

      const fileBuffer = document.buffer;
      const hash = CryptoUtils.computeFileHash(fileBuffer);

      // Validate content is a valid SHA-256 hash
      if (!CryptoUtils.isValidSHA256Hash(hash)) {
        return {
          success: false,
          message: "content must be a valid SHA-256 hash (64 hex characters)",
        };
      }

      const metadata = certificationCode;
      const description = `Certification ${certificationCode} of ${companyDataParsed!.companyName}`;
      const result = await this.notarizationService.createLockedNotarization(
        hash,
        metadata || "",
        description,
        { unlockAt: isoToMilliseconds(certificationExpireDate)! },
      );

      //saving the notarization id in the certification table
      await connection.execute(
        `INSERT INTO iota_certifications (certification_id, transactionDigest, notarizationId, note) VALUES (?, ?, ?, ?)`,
        [certificationId, result.transactionDigest, result.notarizationId, ""],
      );

      await connection.commit();

      return {
        success: true,
        message: "Certification created successfully",
        data: {
          notarizationId: result.notarizationId,
        },
      };
    } catch (error: any) {
      await connection.rollback();
      console.error("Error creating certification:", error);
      return {
        success: false,
        message: "Error creating certification: " + error.message,
      };
    } finally {
      connection.release();
    }
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

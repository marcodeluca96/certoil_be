import { Request, Response } from "express";
import { CertificationService } from "../services/certificationService";
import { getBaseUrl } from "../utils/env";

const certificationService = new CertificationService();

export class CertificationController {
  async createCertification(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "file is required (as multipart/form-data)",
        });
      }
      const document = req.file;
      const { companyData, certificationExpireDate, oilData, certificationNote = null } = req.body;

      //check mandatory fields
      const { success, message, data } = await certificationService.createCertification(
        companyData,
        certificationExpireDate,
        certificationNote,
        oilData,
        document as Express.Multer.File,
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          error: message,
        });
      }

      return res.status(200).json({
        success: true,
        message,
        data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  /** GET ALL CERTIFICATIONS with pagination
   *
   */
  async getAllCertifications(req: Request, res: Response) {
    try {
      const { page, limit } = req.query as { page: string; limit: string };
      const { success, message, data } = await certificationService.getAllCertifications(
        parseInt(page || "1"),
        parseInt(limit || "10"),
      );
      if (!success) {
        return res.status(400).json({
          success: false,
          error: message,
        });
      }
      return res.status(200).json({
        success: true,
        message,
        data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}

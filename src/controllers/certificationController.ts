import { Request, Response } from "express";
import { CertificationService } from "../services/certificationService";

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

      const protocol = req.protocol;
      const host = req.get("host");
      return res.status(200).json({
        success: true,
        message,
        data: {
          iotaVerificationUrl: `${protocol}://${host}/iota/${data?.notarizationId}`,
        },
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

import fs from "fs";
import path from "path";
import { CONSTS } from "../utils/env";
import { pool } from "../db/connection";
import { PoolConnection } from "mysql2/promise";

export class DocumentService {
  constructor() {}

  async saveDocument(
    companyId: number,
    certificationId: number,
    document: Express.Multer.File,
    externalConnection?: PoolConnection,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Create destination directory if it doesn't exist
      const uploadDir = CONSTS.UPLOAD_DOC_PATH;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a safe unique filename: companyId_certId_timestamp_originalName
      // Use standard path join for cross-platform compatibility
      const fileExt = path.extname(document.originalname);
      const safeFileName = `${companyId}_${certificationId}_${Date.now()}${fileExt}`;
      const finalPath = path.join(uploadDir, safeFileName);

      //save document in file system
      fs.writeFileSync(finalPath, document.buffer);

      const connection = externalConnection || (await pool.getConnection());

      try {
        await connection.execute(
          `INSERT INTO documents (company_id, certification_id, document_name, document_path) 
           VALUES (?, ?, ?, ?)`,
          [companyId, certificationId, document.originalname, finalPath],
        );
        return {
          success: true,
          message: "Document info saved successfully",
        };
      } finally {
        if (!externalConnection) {
          connection.release();
        }
      }
    } catch (error: any) {
      console.error("Error saving document info:", error);
      return {
        success: false,
        message: "Database error: " + error.message,
      };
    }
  }
}

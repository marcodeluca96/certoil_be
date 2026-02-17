import { CompanyDTO } from "../types/models";
import { pool } from "../db/connection";
import { PoolConnection } from "mysql2/promise";

export class CompanyService {
  constructor() {}

  async createCompany(
    companyData: CompanyDTO,
    connection?: PoolConnection,
  ): Promise<{ success: boolean; message: string; companyId?: number }> {
    try {
      const {
        companyName,
        address,
        zipCode,
        city,
        province,
        vatNumber,
        taxCode,
        email,
        certifiedEmail,
        phoneNumber,
        website,
      } = companyData;

      if (!connection) {
        connection = await pool.getConnection();
      }

      try {
        // Check if company exists by email (unique constraint)
        const [rows] = await connection.execute(
          "SELECT id FROM companies WHERE email = ? or certified_email = ?",
          [email, certifiedEmail],
        );

        let companyId: number;

        if ((rows as any[]).length > 0) {
          // Update existing company
          companyId = (rows as any[])[0].id;
          await connection.execute(
            `UPDATE companies SET 
              company_name = ?, address = ?, zip_code = ?, city = ?, province = ?, 
              vat_number = ?, tax_code = ?, certified_email = ?, phone_number = ?, website = ?
             WHERE id = ?`,
            [
              companyName,
              address,
              zipCode,
              city,
              province,
              vatNumber,
              taxCode,
              certifiedEmail || null,
              phoneNumber || null,
              website || null,
              companyId,
            ],
          );
        } else {
          // Insert new company
          const [result] = await connection.execute(
            `INSERT INTO companies (
              company_name, address, zip_code, city, province, 
              vat_number, tax_code, email, certified_email, phone_number, website
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              companyName,
              address,
              zipCode,
              city,
              province,
              vatNumber,
              taxCode,
              email,
              certifiedEmail || null,
              phoneNumber || null,
              website || null,
            ],
          );
          companyId = (result as any).insertId;
        }

        return {
          success: true,
          message: "Company created/updated successfully",
          companyId: companyId,
        };
      } finally {
        connection.release();
      }
    } catch (error: any) {
      console.error("Error creating company:", error);
      return {
        success: false,
        message: "Database error: " + error.message,
      };
    }
  }
}

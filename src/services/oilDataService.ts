import { PoolConnection } from "mysql2/promise";
import { pool } from "../db/connection";
import { OilDataDTO } from "../types/models";

export class OilDataService {
  constructor() {}

  async saveOilData(
    companyId: number,
    certificationId: number,
    oilData: OilDataDTO[],
    connection?: PoolConnection,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!connection) {
        connection = await pool.getConnection();
      }
      try {
        const placeholders = oilData.map(() => "(?, ?, ?, ?, ?)").join(", ");
        const values = oilData.flatMap((oil) => [
          companyId,
          certificationId,
          oil.name,
          oil.value,
          oil.unit,
        ]);
        await connection.execute(
          `INSERT INTO oil_data (company_id, certification_id, name, value, unit) VALUES ${placeholders}`,
          values,
        );
        return {
          success: true,
          message: "Oil data saved successfully",
        };
      } finally {
        connection.release();
      }
    } catch (error: any) {
      console.error("Error saving oil data:", error);
      return {
        success: false,
        message: "Database error: " + error.message,
      };
    }
  }
}

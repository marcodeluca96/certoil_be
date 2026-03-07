import { Request, Response } from "express";

export class CompanyController {
  async getCertificationHistory(req: Request, res: Response) {
    try {
      const { companyId } = req.query;
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: "companyId missing",
        });
      }

      return res.status(200).json({
        success: true,
        message: "",
        data: [],
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

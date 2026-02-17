import { CompanyDTO } from "../types/models";

export class CompanyService {
  constructor() {}

  async createCompany(companyData: CompanyDTO) {
    return {
      success: true,
      message: "Company created successfully",
    };
  }
}

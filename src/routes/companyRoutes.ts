import { Router } from "express";
import { CompanyController } from "../controllers/companyController";

const router = Router();
const controller = new CompanyController();

router.get(
  "/:companyId/history",
  controller.getCertificationHistory.bind(controller),
);

export { router as companyRoutes };

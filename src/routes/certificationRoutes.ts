import { Router } from "express";
import multer from "multer";
import { CONSTS } from "../utils/env";
import { CertificationController } from "../controllers/certificationController";

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  dest: CONSTS.UPLOAD_DOC_PATH,
  storage: multer.memoryStorage(),
}); // 10 MB limit

const router = Router();
const controller = new CertificationController();

router.post("/", upload.single("document"), controller.createCertification.bind(controller));
router.get("/", controller.getAllCertifications.bind(controller));

export { router as certificationRoutes };

import { Router } from "express";
import { NotarizationController } from "../controllers/notarizationController";
import multer from "multer";
import { CONSTS } from "../utils/env";
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  dest: CONSTS.UPLOAD_DOC_PATH,
}); // 10 MB limit

const router = Router();
const controller = new NotarizationController();

// System Operations - SPECIFIC ROUTES FIRST
router.get("/health", controller.healthCheck.bind(controller));
router.get("/wallet/info", controller.getWalletInfo.bind(controller));

// Notarization Operations
// router.post("/hash", upload.single("file"), controller.createFileHash.bind(controller));
// router.post("/dynamic", controller.createDynamic.bind(controller));
router.post("/locked", controller.createLocked.bind(controller));
// router.put("/:notarizationId/state", controller.updateState.bind(controller));
// router.put("/:notarizationId/metadata", controller.updateMetadata.bind(controller));
// router.post("/:notarizationId/transfer", controller.transferNotarization.bind(controller));

//elimina notarizzazione ma solo se il deleteLockDate è scaduto
router.delete("/:notarizationId", controller.destroyNotarization.bind(controller));

// Query Operations - PARAMETERIZED ROUTES LAST
//verifica scadenza tramite proprietà deleteLockDate ricevuta
router.get("/:notarizationId/lock-metadata", controller.getLockMetaData.bind(controller));
// otteniamo info sul documento tra cui il contenuto presente in blockchain
router.get("/:notarizationId", controller.getDetails.bind(controller));
// verifichiamo integrità documento
router.post("/verify", controller.verify.bind(controller));

export { router as notarizationRoutes };

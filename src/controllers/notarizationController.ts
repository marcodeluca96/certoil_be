import { Request, Response } from "express";
import { NotarizationService } from "../services/notarizationService";
import { CryptoUtils } from "../utils/crypto";
import { CONSTS } from "../utils/env";

const notarizationService = new NotarizationService();

export class NotarizationController {
  // Compute hash for uploaded file
  async createFileHash(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "file is required (as multipart/form-data)",
        });
      }

      const fileBuffer = req.file.buffer;
      const hash = CryptoUtils.computeFileHash(fileBuffer);

      res.json({
        success: true,
        hash,
        algorithm: "sha256",
      });
    } catch (error: any) {
      console.error("File hash error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Create Dynamic Notarization
  async createDynamic(req: Request, res: Response) {
    try {
      const { content, metadata, description, transferLock } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: "content is required",
        });
      }

      // Validate content is a valid SHA-256 hash
      if (!CryptoUtils.isValidSHA256Hash(content)) {
        return res.status(400).json({
          success: false,
          error: "content must be a valid SHA-256 hash (64 hex characters)",
        });
      }

      const result = await notarizationService.createDynamicNotarization(
        content,
        metadata || "",
        description,
        transferLock,
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Create dynamic error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Create Locked Notarization
  async createLocked(req: Request, res: Response) {
    try {
      const { content, metadata, description, deleteLock } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: "content is required",
        });
      }

      // Validate content is a valid SHA-256 hash
      if (!CryptoUtils.isValidSHA256Hash(content)) {
        return res.status(400).json({
          success: false,
          error: "content must be a valid SHA-256 hash (64 hex characters)",
        });
      }

      const result = await notarizationService.createLockedNotarization(
        content,
        metadata || "",
        description,
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Create locked error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update State
  async updateState(req: Request, res: Response) {
    try {
      const { notarizationId } = req.params;
      const { content, metadata } = req.body;

      if (!notarizationId || !content) {
        return res.status(400).json({
          success: false,
          error: "notarizationId and content are required",
        });
      }

      // Validate content is a valid SHA-256 hash
      if (!CryptoUtils.isValidSHA256Hash(content)) {
        return res.status(400).json({
          success: false,
          error: "content must be a valid SHA-256 hash (64 hex characters)",
        });
      }

      const result = await notarizationService.updateState(
        notarizationId as string,
        content,
        metadata || "",
      );

      res.json({
        success: true,
        notarizationId,
        ...result,
      });
    } catch (error: any) {
      console.error("Update state error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update Metadata
  async updateMetadata(req: Request, res: Response) {
    try {
      const { notarizationId } = req.params;
      const { metadata } = req.body;

      if (!notarizationId) {
        return res.status(400).json({
          success: false,
          error: "notarizationId is required",
        });
      }

      const result = await notarizationService.updateMetadata(notarizationId as string, metadata);

      res.json({
        success: true,
        notarizationId,
        ...result,
      });
    } catch (error: any) {
      console.error("Update metadata error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Transfer Notarization
  async transferNotarization(req: Request, res: Response) {
    try {
      const { notarizationId } = req.params;
      const { recipientAddress } = req.body;

      if (!notarizationId || !recipientAddress) {
        return res.status(400).json({
          success: false,
          error: "notarizationId and recipientAddress are required",
        });
      }

      const result = await notarizationService.transferNotarization(
        notarizationId as string,
        recipientAddress,
      );

      res.json({
        success: true,
        notarizationId,
        recipientAddress,
        ...result,
      });
    } catch (error: any) {
      console.error("Transfer error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Destroy Notarization
  async destroyNotarization(req: Request, res: Response) {
    try {
      const { notarizationId } = req.params;

      if (!notarizationId) {
        return res.status(400).json({
          success: false,
          error: "notarizationId is required",
        });
      }

      const result = await notarizationService.destroyNotarization(notarizationId as string);

      res.json({
        success: true,
        notarizationId,
        ...result,
      });
    } catch (error: any) {
      console.error("Destroy error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get Notarization Details
  async getDetails(req: Request, res: Response) {
    try {
      const { notarizationId } = req.params;

      if (!notarizationId) {
        return res.status(400).json({
          success: false,
          error: "notarizationId is required",
        });
      }

      const details = await notarizationService.getNotarizationDetails(notarizationId as string);

      res.json({
        success: true,
        ...details,
      });
    } catch (error: any) {
      console.error("Get details error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Verify Notarization
  async verify(req: Request, res: Response) {
    try {
      const { notarizationId, expectedContent } = req.body;

      if (!notarizationId || !expectedContent) {
        return res.status(400).json({
          success: false,
          error: "notarizationId and expectedContent are required",
        });
      }

      // Validate expectedContent is a valid SHA-256 hash
      if (!CryptoUtils.isValidSHA256Hash(expectedContent)) {
        return res.status(400).json({
          success: false,
          error: "expectedContent must be a valid SHA-256 hash (64 hex characters)",
        });
      }

      const result = await notarizationService.verifyNotarization(notarizationId, expectedContent);

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Verify error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get Wallet Info
  async getWalletInfo(req: Request, res: Response) {
    try {
      const walletInfo = await notarizationService.getWalletInfo();

      res.json({
        success: true,
        ...walletInfo,
      });
    } catch (error: any) {
      console.error("Wallet info error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Health Check - UPDATED METHOD
  async healthCheck(req: Request, res: Response) {
    try {
      const health = await notarizationService.healthCheck();

      if (health.success) {
        res.json({
          success: true,
          message: "IOTA Notarization Backend is healthy",
          timestamp: health.timestamp,
          network: CONSTS.IOTA_NET,
          packageId: CONSTS.IOTA_NOTARIZATION_PKG_ID,
          wallet: health.wallet,
        });
      } else {
        res.status(500).json(health);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Health check failed: ${error.message}`,
      });
    }
  }

  async getLockMetaData(req: Request, res: Response) {
    try {
      const { notarizationId } = req.params;

      if (!notarizationId) {
        return res.status(400).json({
          success: false,
          error: "notarizationId is required",
        });
      }

      const lockMetaData = await notarizationService.getLockMetaData(notarizationId as string);

      res.json({
        success: true,
        ...lockMetaData,
      });
    } catch (error: any) {
      console.error("Get lock metadata error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

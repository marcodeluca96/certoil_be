import express from "express";
import { CONSTS } from "./utils/env";
import { get_status } from "./routes/get_status";
import { notarizationRoutes } from "./routes/notarizationRoutes";
import { certificationRoutes } from "./routes/certificationRoutes";
import { checkDatabaseConnection } from "./db/connection";
import cors from "cors";

const app = express();
const PORT = CONSTS.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use(get_status);
app.use("/iota", notarizationRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/certificates", express.static(CONSTS.CERTIFICATES_PNG_PATH));

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

app.listen(PORT, async () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
  console.log(`📡 Connected to network: ${CONSTS.IOTA_NET}`);
  console.log(`🔗 Package ID: ${process.env.IOTA_NOTARIZATION_PKG_ID}`);
  await checkDatabaseConnection();
});

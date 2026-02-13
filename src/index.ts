import express from 'express';
import { CONSTS } from './utils/env';
import { get_status } from './routes/get_status';
import { notarizationRoutes } from './routes/notarizationRoutes';

const app = express();
const PORT = CONSTS.PORT || 3000;

app.use(express.json());

app.use(get_status);
app.use(notarizationRoutes);

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
  console.log(`🚀 IOTA Notarization Backend running on port ${PORT}`);
  console.log(`📡 Connected to network: ${CONSTS.IOTA_NET}`);
  console.log(`🔗 Package ID: ${process.env.IOTA_NOTARIZATION_PKG_ID}`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api/notarizations`);
  console.log(
    `💚 Health check: http://localhost:${PORT}/api/notarizations/health`
  );
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
});
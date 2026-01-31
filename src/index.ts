import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { CONSTS } from './utils/env';

dotenv.config();

const app = express();
const PORT = CONSTS.PORT || 3000;

app.use(express.json());

app.get('/status', (req: Request, res: Response) => {
  res.send('Server Express con TypeScript funziona!');
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
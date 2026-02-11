import express from 'express';
import { CONSTS } from './utils/env';
import { get_status } from './routes/get_status';

const app = express();
const PORT = CONSTS.PORT || 3000;

app.use(express.json());

app.use(get_status);

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
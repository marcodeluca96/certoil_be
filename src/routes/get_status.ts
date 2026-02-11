import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/status', (req: Request, res: Response) => {
    res.send('Server Express con TypeScript funziona!');
});

export { router as get_status };

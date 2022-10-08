import express from 'express';
import { Service } from 'typedi';

@Service()
export class AuthController {
    getTest(req: express.Request, res: express.Response) {
        res.status(200).json({
            message: 'Hello World',
        });
    }
}

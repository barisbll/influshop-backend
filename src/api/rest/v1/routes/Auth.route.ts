import express from 'express';
import Container from 'typedi';
import { AuthController } from '../controllers/AuthController/Auth.controller';

export const createRouter = () => {
    const authController = Container.get(AuthController);

    const router = express.Router();

    router.get('/test', authController.getTest);

    return router;
};

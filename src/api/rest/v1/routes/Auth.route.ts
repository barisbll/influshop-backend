import express from 'express';
import Container from 'typedi';
import { AuthController } from '../controllers/Auth/Auth.controller';

export const createRouter = () => {
    const authController = Container.get(AuthController);

    const router = express.Router();

    router.post('/signup-user', authController.signupUser);

    return router;
};

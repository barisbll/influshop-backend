import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { AuthController } from '../controllers/Auth/Auth.controller';

export const createRouter = () => {
    const authController = Container.get(AuthController);

    const router = express.Router();

    router.post('/user/signup', authController.userSignup);

    router.post('/user/login', authController.userLogin);

    router.post('/user/refresh-token', isAuth,  authController.userRefreshToken);

    return router;
};

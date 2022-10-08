import express from 'express';
import { createRouter as createAuthRoutes } from './Auth.route';

export const createRouter = () => {
    const router = express.Router();

    router.use('/auth', createAuthRoutes());

    return router;
};

import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { AuthService } from '../../../../../service/Auth/Auth.service';
import { UserSignupRequest } from './Auth.types';
import { userSignupValidator } from './validators/UserSignup.validator';

@Service()
export class AuthController {
    // eslint-disable-next-line no-unused-vars
    constructor(private readonly authService: AuthService) {}

    signupUser = async (req: Request, res: Response, next:NextFunction) => {
        req.body as UserSignupRequest;
        try {
            const validatedBody = await userSignupValidator(req.body);
            await this.authService.signupUser(validatedBody);
            res.json({ message: 'User Successfully Created' }).status(HttpStatus.OK);
        } catch (err) {
            next(err);
        }
    };

    // loginUser = async (req: Request, res: Response, next:NextFunction) => {
    // };

    // logoutUser = async (req: Request, res: Response, next:NextFunction) => {
    // };

    // signupInfluencer = async (req: Request, res: Response, next:NextFunction) => {
    // };

    // loginInfluencer = async (req: Request, res: Response, next:NextFunction) => {
    // };

    // logoutInfluencer = async (req: Request, res: Response, next:NextFunction) => {
    // };
}

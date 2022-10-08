import { NextFunction, Request, Response } from 'express';

export default class CustomError {
    message!: string;

    status!: number;

    additionalInfo!: any;

    constructor(message: string, status: number = 500, additionalInfo: any = {}) {
      this.message = message;
      this.status = status;
      this.additionalInfo = additionalInfo;
    }
  }

export const errorHandler = (
    err: TypeError | CustomError,
    req: Request,
    res: Response,
    // eslint-disable-next-line
    next: NextFunction
  ) => {
    let customError = err;

    if (!(err instanceof CustomError)) {
      customError = new CustomError(err.message);
    }

    res.status((customError as CustomError).status).send(customError);
  };

import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { UserReportInspectRequest } from '../Report.type';

export const userReportInspectValidator = async (
    userReportInspectRequest: UserReportInspectRequest,
) => {
  const schema = yup.object().shape({
    username: yup.string().required(),
    isApprove: yup.boolean().required(),
  });

  try {
    return await schema.validate(userReportInspectRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

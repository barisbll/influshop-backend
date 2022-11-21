import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { UserReportCreateRequest } from '../Report.type';
import { UserReportEnum } from '../../../../../../db/entities/userRelated/UserReport';

export const userReportCreateValidator = async (
  userReportCreateRequest: UserReportCreateRequest,
) => {
  const schema = yup.object().shape({
    userId: yup.string().uuid().required(),
    reason: yup
      .mixed<UserReportEnum>()
      .oneOf(Object.values(UserReportEnum))
      .required(),
    isReporterUser: yup.boolean().required(),
    isReport: yup.boolean().required(),
  });

  try {
    return await schema.validate(userReportCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

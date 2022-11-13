import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const itemReportAdminReadValidator = async (reportReadRequest: { itemId: string}) => {
  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
  });

  try {
    return await schema.validate(reportReadRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

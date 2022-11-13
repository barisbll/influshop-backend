import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemReportInspectRequest } from '../Report.type';

export const itemReportInspectValidator = async (
    itemReportInspectRequest: ItemReportInspectRequest,
) => {
  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    isApprove: yup.boolean().required(),
  });

  try {
    return await schema.validate(itemReportInspectRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

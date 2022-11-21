import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const influencerReportReadValidator = async (reportReadRequest: {
  influencerId: string;
  isReaderUser: boolean;
}) => {
  const schema = yup.object().shape({
    influencerId: yup.string().uuid().required(),
    isReaderUser: yup.boolean().required(),
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

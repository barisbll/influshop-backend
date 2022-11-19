import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const commentReportAdminReadValidator = async (reportReadRequest: {
  commentId: string;
  pageId: string;
  isControlled?: string | boolean;
}) => {
  const schema = yup.object().shape({
    commentId: yup.string().uuid().required(),
    pageId: yup.number().min(1).required(),
    isControlled: yup.boolean().optional(),
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

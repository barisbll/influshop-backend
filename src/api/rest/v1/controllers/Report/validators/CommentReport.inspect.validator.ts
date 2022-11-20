import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CommentReportInspectRequest } from '../Report.type';

export const commentReportInspectValidator = async (
    commentReportInspectRequest: CommentReportInspectRequest,
) => {
  const schema = yup.object().shape({
    commentId: yup.string().uuid().required(),
    isApprove: yup.boolean().required(),
  });

  try {
    return await schema.validate(commentReportInspectRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

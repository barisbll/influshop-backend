import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CommentReportCreateRequest } from '../Report.type';
import { CommentReportEnum } from '../../../../../../db/entities/itemRelated/CommentReport';

export const commentReportCreateValidator = async (
  commentReportCreateRequest: CommentReportCreateRequest,
) => {
  const schema = yup.object().shape({
    commentId: yup.string().uuid().required(),
    reason: yup
      .mixed<CommentReportEnum>()
      .oneOf(Object.values(CommentReportEnum))
      .required(),
    isReporterUser: yup.boolean().required(),
    isReport: yup.boolean().required(),
  });

  try {
    return await schema.validate(commentReportCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

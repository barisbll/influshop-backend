import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CommentLikeOperationRequest } from '../Comment.type';

export const commentLikeValidator = async (
    commentLikeRequest: CommentLikeOperationRequest,
) => {
  const schema = yup.object().shape({
    commentId: yup.string().uuid().required(),
    isLike: yup.boolean().required(),
  });

  try {
    return await schema.validate(commentLikeRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

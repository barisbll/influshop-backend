import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CommentDislikeOperationRequest } from '../Comment.type';

export const commentDislikeValidator = async (
    commentDislikeRequest: CommentDislikeOperationRequest,
) => {
  const schema = yup.object().shape({
    commentId: yup.string().uuid().required(),
    isDislike: yup.boolean().required(),
  });

  try {
    return await schema.validate(commentDislikeRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

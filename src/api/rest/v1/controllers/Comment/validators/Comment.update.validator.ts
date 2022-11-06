import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CommentUpdateRequest } from '../Comment.type';

export const commentUpdateValidator = async (
    commentUpdateRequest: CommentUpdateRequest,
) => {
  const commentImageScheme = yup.object().shape({
    image: yup.string().required(),
    order: yup.number().min(1).max(5).required(),
    isNew: yup.boolean().required(),
  });

  const schema = yup.object().shape({
    commentId: yup.string().uuid().required(),
    comment: yup.string().min(1).max(560).optional(),
    commentImages: yup.array().of(commentImageScheme).optional(),
  });

  try {
    return await schema.validate(commentUpdateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

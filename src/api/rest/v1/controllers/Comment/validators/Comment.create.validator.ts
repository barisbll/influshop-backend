import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CommentCreateRequest } from '../Comment.type';

export const commentCreateValidator = async (
    commentCreateRequest: CommentCreateRequest,
) => {
  const itemImageScheme = yup.object().shape({
    image: yup.string().required(),
    order: yup.number().min(1).max(5).required(),
  });

  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    comment: yup.string().min(1).max(5).required(),
    commentImages: yup.array().of(itemImageScheme).optional(),
  });

  try {
    return await schema.validate(commentCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { AddToFavoriteRequest } from '../eCommerce.type';

export const addToFavoriteValidator = async (
    addToFavoriteRequest: AddToFavoriteRequest,
) => {
  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    isAddToFavorite: yup.boolean().required(),
  });

  try {
    return await schema.validate(addToFavoriteRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

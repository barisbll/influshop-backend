import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { AddToCartRequest } from '../eCommerce.type';

export const addToCartValidator = async (
    addToCartRequest: AddToCartRequest,
) => {
  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    itemQuantity: yup.number().min(1).required(),
    isAddToCart: yup.boolean().required(),
  });

  try {
    return await schema.validate(addToCartRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

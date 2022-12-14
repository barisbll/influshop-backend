import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CheckoutRequest } from '../eCommerce.type';

export const checkoutValidator = async (
    checkoutRequest: CheckoutRequest,
) => {
  const schema = yup.object().shape({
    creditCard: yup.object().shape({
      cardNumber: yup.string().max(16).required(),
      cardHolderName: yup.string().min(6).required(),
      expirationDate: yup.string().length(5).required(),
      cvv: yup.string().length(3).required(),
    }).required(),
    shippingAddress: yup.object().shape({
      addressName: yup.string().required(),
      address: yup.string().optional(),
      country: yup.string().required(),
      state: yup.string().optional(),
      city: yup.string().required(),
      street: yup.string().required(),
      zip: yup.string().required(),
    }).required(),
  });

  try {
    return await schema.validate(checkoutRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

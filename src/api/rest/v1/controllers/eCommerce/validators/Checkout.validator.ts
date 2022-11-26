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
      cardNumber: yup.string().required(),
      cardHolderName: yup.string().required(),
      expirationDate: yup.string().required(),
      cvv: yup.string().required(),
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

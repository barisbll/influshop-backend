import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CreditCardCreateRequest } from '../Settings.type';

export const creditCardCreateValidator = async (
  creditCardCreateRequest: CreditCardCreateRequest,
) => {
  const schema = yup.object().shape({
    creditCardName: yup.string().max(32).required(),
    cardNumber: yup.string().length(16).required(),
    cardHolderName: yup.string().min(6).required(),
    expirationDate: yup.string().length(5).required(),
    cvv: yup.string().length(3).required(),
  });

  try {
    return await schema.validate(creditCardCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

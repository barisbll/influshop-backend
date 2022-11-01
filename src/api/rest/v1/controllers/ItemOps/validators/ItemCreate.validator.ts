import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemCreateRequest } from '../ItemOps.type';

export const itemCreateValidator = async (
    itemCreateRequest: ItemCreateRequest,
) => {
  const itemImageScheme = yup.object().shape({
    image: yup.string().required(),
    order: yup.number().min(1).max(10).required(),
  });

  const schema = yup.object().shape({
    itemName: yup.string().min(4).max(20).required(),
    itemDescription: yup.string().min(1).max(280).optional(),
    itemPrice: yup.number().min(1).max(50000).required(),
    itemQuantity: yup.number().min(1).max(50000).required(),
    isPinned: yup.boolean().required(),
    itemImages: yup.array().of(itemImageScheme).optional(),
  });

  try {
    return await schema.validate(itemCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

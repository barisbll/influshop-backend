import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemWithExtraCreateRequest } from '../ItemOps.type';

export const itemWithExtraCreateValidator = async (
  itemWithExtraCreateRequest: ItemWithExtraCreateRequest,
) => {
  const schema = yup.object().shape({
    itemName: yup.string().min(4).max(20).required(),
    extraFeatures: yup.object().required(),
    itemDescription: yup.string().min(1).max(280).optional(),
    itemPrice: yup.number().min(1).max(50000).required(),
    itemQuantity: yup.number().min(1).max(50000).required(),
    itemGroupName: yup.string().min(4).max(20).required(),
  });

  try {
    return await schema.validate(itemWithExtraCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

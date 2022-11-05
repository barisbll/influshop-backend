import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemWithExtraUpdateRequest } from '../ItemOps.type';

export const itemWithExtraUpdateValidator = async (
    itemWithExtraUpdateRequest: ItemWithExtraUpdateRequest,
) => {
  const itemImageScheme = yup.object().shape({
    image: yup.string().required(),
    order: yup.number().min(1).max(5).required(),
    isNew: yup.boolean().required(),
  });

const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    itemName: yup.string().min(4).max(20).optional(),
    extraFeatures: yup.object().optional(),
    itemDescription: yup.string().min(1).max(280).optional(),
    itemPrice: yup.number().min(1).max(50000).optional(),
    itemQuantity: yup.number().min(1).max(50000).optional(),
    itemGroupName: yup.string().min(4).max(20).optional(),
    isPinned: yup.boolean().optional(),
    itemImages: yup.array().of(itemImageScheme).optional(),
  });

  try {
    return await schema.validate(itemWithExtraUpdateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

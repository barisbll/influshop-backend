import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemGroupUpdateRequest } from '../ItemOps.type';

export const itemGroupUpdateValidator = async (itemGroupUpdateRequest: ItemGroupUpdateRequest) => {
  const schema = yup.object().shape({
    itemGroupId: yup.string().uuid().required(),
    itemGroupName: yup.string().min(4).max(20).optional(),
    extraFeatures: yup.array().of(yup.string()).min(1).max(5)
.optional(),
    itemGroupImage: yup.string().optional(),
  });

  try {
    return await schema.validate(itemGroupUpdateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

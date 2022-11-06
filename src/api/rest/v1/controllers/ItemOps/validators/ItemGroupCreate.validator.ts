import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemGroupCreateRequest } from '../ItemOps.type';

export const itemGroupCreateValidator = async (itemGroupCreateReq: ItemGroupCreateRequest) => {
  const schema = yup.object().shape({
    itemGroupName: yup.string().min(4).max(20).required(),
    itemGroupDescription: yup.string().min(1).max(280).optional(),
    extraFeatures: yup.array().of(yup.string()).min(1).max(5)
.required(),
    itemGroupImage: yup.string().optional(),
  });

  try {
    return await schema.validate(itemGroupCreateReq, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

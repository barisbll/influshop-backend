import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const itemGetWithExtraFeaturesValidator = async (itemGetRequest: {
  influencerName: string;
  itemGroupName: string;
}) => {
  const schema = yup.object().shape({
    influencerName: yup.string().min(4).max(20).required(),
    itemGroupName: yup.string().min(4).max(20).required(),
  });

  try {
    return await schema.validate(itemGetRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

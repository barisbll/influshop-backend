import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { ItemReportCreateRequest } from '../Report.type';
import { ItemReportEnum } from '../../../../../../db/entities/itemRelated/ItemReport';

export const itemReportCreateValidator = async (
  itemReportCreateRequest: ItemReportCreateRequest,
) => {
  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    reason: yup
      .mixed<ItemReportEnum>()
      .oneOf(Object.values(ItemReportEnum))
      .required(),
    isReporterUser: yup.boolean().required(),
    isReport: yup.boolean().required(),
  });

  try {
    return await schema.validate(itemReportCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

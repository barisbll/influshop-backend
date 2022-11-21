import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { InfluencerReportCreateRequest } from '../Report.type';
import { InfluencerReportEnum } from '../../../../../../db/entities/influencerRelated/InfluencerReport';

export const influencerReportCreateValidator = async (
    influencerReportCreateRequest: InfluencerReportCreateRequest,
) => {
  const schema = yup.object().shape({
    influencerId: yup.string().uuid().required(),
    reason: yup
      .mixed<InfluencerReportEnum>()
      .oneOf(Object.values(InfluencerReportEnum))
      .required(),
    isReporterUser: yup.boolean().required(),
    isReport: yup.boolean().required(),
  });

  try {
    return await schema.validate(influencerReportCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};

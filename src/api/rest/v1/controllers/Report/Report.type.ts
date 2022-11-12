import { ItemReportEnum } from '../../../../../db/entities/itemRelated/ItemReport';

export type ItemReportCreateRequest = {
    itemId: string;
    reason: ItemReportEnum;
    isReporterUser: boolean;
    isReport: boolean;
};

export type ItemReportReadRequest = {
    itemId: string;
    isReaderUser: boolean;
};

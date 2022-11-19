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

export type ItemReportInspectRequest = {
    itemId: string;
    isApprove: boolean;
};

export type ItemReportAdminReadRequest = {
    itemId: string;
    pageId: number;
    isControlled?: boolean;
    isApproved?: boolean | null | string;
};

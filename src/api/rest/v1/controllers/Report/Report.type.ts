import { ItemReportEnum } from '../../../../../db/entities/itemRelated/ItemReport';
import { CommentReportEnum } from '../../../../../db/entities/itemRelated/CommentReport';

// Item Report
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

// Comment Report
export type CommentReportCreateRequest = {
    commentId: string;
    reason: CommentReportEnum;
    isReporterUser: boolean;
    isReport: boolean;
};

export type CommentReportReadRequest = {
    commentId: string;
    isReaderUser: boolean;
};

export type CommentReportAdminReadRequest = {
    commentId: string;
    pageId: number;
    isControlled?: boolean;
    isApproved?: boolean | null | string;
};

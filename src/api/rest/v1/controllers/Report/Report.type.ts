import { ItemReportEnum } from '../../../../../db/entities/itemRelated/ItemReport';
import { CommentReportEnum } from '../../../../../db/entities/itemRelated/CommentReport';
import { UserReportEnum } from '../../../../../db/entities/userRelated/UserReport';
import { InfluencerReportEnum } from '../../../../../db/entities/influencerRelated/InfluencerReport';

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

export type CommentReportInspectRequest = {
    commentId: string;
    isApprove: boolean;
};

// User Report
export type UserReportCreateRequest = {
    userId: string;
    reason: UserReportEnum;
    isReporterUser: boolean;
    isReport: boolean;
};

export type UserReportReadRequest = {
    userId: string;
    isReaderUser: boolean;
};

export type UserReportAdminReadRequest = {
    userId: string;
    pageId: number;
    isControlled?: boolean;
    isApproved?: boolean | null | string;
};

export type UserReportInspectRequest = {
    userId: string;
    isApprove: boolean;
};

// Influencer Report
export type InfluencerReportCreateRequest = {
    influencerId: string;
    reason: InfluencerReportEnum;
    isReporterUser: boolean;
    isReport: boolean;
};

export type InfluencerReportReadRequest = {
    influencerId: string;
    isReaderUser: boolean;
};

export type InfluencerReportAdminReadRequest = {
    influencerId: string;
    pageId: number;
    isControlled?: boolean;
    isApproved?: boolean | null | string;
};

export type InfluencerReportInspectRequest = {
    influencerId: string;
    isApprove: boolean;
};

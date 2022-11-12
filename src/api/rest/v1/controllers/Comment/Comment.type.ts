type CommentImage = {
    image: string;
    order: number;
}

export type CommentCreateRequest = {
    itemId: string;
    comment: string;
    commentImages?: CommentImage[];
};

type ImageWithOrderUpdate = {
    image: string;
    order: number;
    isNew: boolean;
  };

export type CommentUpdateRequest = {
    commentId: string;
    comment?: string;
    commentImages?: ImageWithOrderUpdate[];
};

export type CommentLikeOperationRequest = {
    commentId: string;
    isLike: boolean;
};

export type CommentDislikeOperationRequest = {
    commentId: string;
    isDislike: boolean;
};

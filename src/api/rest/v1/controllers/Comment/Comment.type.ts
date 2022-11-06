type CommentImage = {
    image: string;
    order: number;
}

export type CommentCreateRequest = {
    itemId: string;
    comment: string;
    commentImages?: CommentImage[];
};

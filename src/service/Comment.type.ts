type CommentImageReturn = {
    image: string;
    order: number;
};

export type CommentReturn = {
  content: string;
  commentImages: CommentImageReturn[] | null;
  createdAt: string;
  createdBy: string;
};

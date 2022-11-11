type CommentImageReturn = {
    image: string;
    order: number;
};

export type CommentReturn = {
  id: string;
  content: string;
  commentImages: CommentImageReturn[] | null;
  createdAt: string;
  createdBy: string;
};

export type AddToCartRequest = {
    itemId: string;
    quantity: number;
    isAddToCart: boolean;
};

export type AddToFavoriteRequest = {
    itemId: string;
    isAddToFavorite: boolean;
};

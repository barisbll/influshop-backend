export type AddToCartRequest = {
  itemId: string;
  quantity: number;
  isAddToCart: boolean;
};

export type AddToFavoriteRequest = {
  itemId: string;
  isAddToFavorite: boolean;
};

type CreditCard = {
  cardNumber: string;
  cardHolderName: string;
  expirationDate: string;
  cvv: string;
};

type Address = {
  addressName: string;
  address?: string;
  country: string;
  state?: string;
  city: string;
  street: string;
  zip: string;
};

export type CheckoutRequest = {
  creditCard: CreditCard;
  shippingAddress: Address;
};

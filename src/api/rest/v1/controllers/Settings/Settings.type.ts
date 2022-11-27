export type AddressCreateRequest = {
    addressName: string;
    address?: string;
    country: string;
    state?: string;
    city: string;
    street: string;
    zip: string;
  };

  export type AddressUpdateRequest = {
    id: string;
    addressName?: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    street?: string;
    zip?: string;
  };

  export type CreditCardCreateRequest = {
    creditCardName: string;
    cardNumber: string;
    cardHolderName: string;
    expirationDate: string;
    cvv: string;
  };

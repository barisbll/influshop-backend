export type SignupRequest = {
    username: string;
    email: string;
    password: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RefreshTokenRequest = {
    id: string;
    email: string;
};

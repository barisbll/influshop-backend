export type UserSignupRequest = {
    username: string;
    email: string;
    password: string;
};

export type UserLoginRequest = {
    email: string;
    password: string;
};

export type RefreshTokenRequest = {
    id: string;
    email: string;
};

export type InfluencerSignupRequest = {
    username: string;
    email: string;
    password: string;
};

export type InfluencerLoginRequest = {
    email: string;
    password: string;
};

export type InfluencerRefreshTokenRequest = {
    influencerId: string;
};

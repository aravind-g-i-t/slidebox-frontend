export interface SignupPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface SigninPayload {
    email: string;
    password: string;
}

export interface VerifyOTPPayload {
    email: string;
    otp: string;
}

export interface User {
    id: string;
    name:string
    email: string;
    phone: string;
}

export interface AuthResponse {
    success: boolean;

    data: {
        user: User;
    };
}
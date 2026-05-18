
export const API = {
    AUTH: {
        SIGNUP: "/auth/signup",
        SIGNIN: "/auth/signin",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        RESEND_OTP: "/auth/otp/resend",
        VERIFY_OTP: "/auth/otp",
        RESET_OTP:"/auth/reset/otp",
        GOOGLE_SIGNIN:"/auth/google",
        VERIFY_EMAIL:'/auth/reset/email',
        RESET_PASSWORD:'/auth/reset/password'
    },
    IMAGES:{
        BASE:"/images",
        UPLOAD:"/images/upload",
        REARRANGE:"/images/rearrange"
    }

} as const;

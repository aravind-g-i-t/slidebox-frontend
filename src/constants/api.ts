
export const API = {
    AUTH: {
        SIGNUP: "/auth/signup",
        SIGNIN: "/auth/signin",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        RESEND_OTP: "/auth/otp/resend",
        VERIFY_OTP: "/auth/otp",
        GOOGLE_SIGNIN:"/auth/google",
        VERIFY_EMAIL:'/auth/reset/email',
        VERIFY_RESET_OTP:'/auth/reset/otp',
        RESET_PASSWORD:'/auth/reset'
    },
    IMAGES:{
        BASE:"/images",
        UPLOAD:"/images/upload",
        REARRANGE:"/images/rearrange"
    }

} as const;

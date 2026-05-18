import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../config/axiosInstance";
import type { SigninPayload, SignupPayload, VerifyOTPPayload } from "../types/authTypes";
import { API } from "../constants/api";


export const signup = createAsyncThunk(
    "/signup",
    async (singupInput: SignupPayload, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.AUTH.SIGNUP, singupInput);
            console.log(result);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    }
)

export const signin = createAsyncThunk(
    "/signin",
    async (input: SigninPayload, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.AUTH.SIGNIN, input);
            console.log(result);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                console.log(error.response?.data);
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    },
)

export const verifyOTP = createAsyncThunk(
    "/verify-otp",
    async (inputData: VerifyOTPPayload, { rejectWithValue }) => {
        try {
            console.log(inputData);
            const result = await axiosInstance.post(API.AUTH.VERIFY_OTP, inputData);
            console.log(result);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    }
)

export const resendOTP = createAsyncThunk(
    "/otp/resend",
    async (inputData: {email:string}, { rejectWithValue }) => {
        try {
            console.log(inputData);
            const result = await axiosInstance.post(API.AUTH.RESEND_OTP, inputData);
            console.log(result);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    }
)

export const tokenRefresh = createAsyncThunk(
    "/auth/refresh",
    async (_, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.AUTH.REFRESH);
            console.log(result);
            return result.data
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data);
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            console.log(error);

            return rejectWithValue("Something went wrong. Please try again.");
        }
    },
)

export const logout = createAsyncThunk(
    "/logout",
    async (_, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.AUTH.LOGOUT);
            console.log(result);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                console.log(error.response?.data);
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            console.log(error);

            return rejectWithValue("Something went wrong. Please try again.");
        }
    },
)

export const resetOTP = createAsyncThunk(
    "/reset-otp",
    async (inputData: VerifyOTPPayload, { rejectWithValue }) => {
        try {
            console.log(inputData);
            const result = await axiosInstance.post(API.AUTH.RESET_OTP, inputData);
            console.log(result);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    }
)

export const verifyEmail = createAsyncThunk(
    "/email/verify",
    async (input: { email: string }, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.AUTH.VERIFY_EMAIL, input);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    }
)

export const resetPassword = createAsyncThunk(
    "/password/reset",
    async (input: { resetToken: string; password: string }, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.AUTH.RESET_PASSWORD, input);

            if (!result.data.success) {
                return rejectWithValue(result.data.message)
            }
            return result.data
        } catch (error: unknown) {

            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || "Invalid request");
            }
            return rejectWithValue("Something went wrong. Please try again.");
        }
    }
)

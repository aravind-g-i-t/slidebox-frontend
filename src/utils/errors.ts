import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof AxiosError) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
};
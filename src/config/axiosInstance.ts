import axios from "axios";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import { logout, tokenRefresh } from "../services/authServices";
import { clearUser } from "../redux/slices/userSlice";

const apiURL = import.meta.env.VITE_API_URL

const axiosInstance: AxiosInstance = axios.create({
    baseURL: apiURL,
    withCredentials: true,

});



axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };
        console.log(error);
        
        const errData = error.response?.data as ErrorResponse | undefined;

        if (
            error.response?.status === 401 &&
            (errData?.message==="No token provided"||errData?.message === "Invalid or expired token" )&&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const res = await store.dispatch(tokenRefresh()).unwrap();
                const newAccessToken = res.data.accessToken;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);
            } catch {
                await store.dispatch(logout());
                store.dispatch(clearUser())
                console.log("Session has expired. Please login again.")
            }
        }
        if (error.response?.status === 403 &&
            errData?.message === "Your account has been blocked.") {
            await store.dispatch(logout());
        }

        // if (!errData?.message) {
        //     console.log(errData);
            
        //     toast.error("Something went wrong. Please try again.");
        // }

        return Promise.reject(error);
    }
);

interface ErrorResponse {
    success: boolean;
    message: string;
}

export default axiosInstance;
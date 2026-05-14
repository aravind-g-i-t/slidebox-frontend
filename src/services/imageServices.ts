import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../config/axiosInstance";
import { API } from "../constants/api";


export const uploadImages = createAsyncThunk(
    "/images/upload",
    async (payload: FormData, { rejectWithValue }) => {
        try {
            const result = await axiosInstance.post(API.IMAGES.UPLOAD, payload);
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

export const getImages = createAsyncThunk(
    "/images",
    async (payload: {skip:number,limit:number}, { rejectWithValue }) => {
        try {
            const {skip,limit}= payload
            const result = await axiosInstance.get(API.IMAGES.BASE,{
                params:{
                    skip,
                    limit
                }
            });
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

    export const reArrangeImages = createAsyncThunk(
        "/images/rearrange",
        async (payload: { draggedId: string; targetOrder: number }, { rejectWithValue }) => {
            try {
                const result = await axiosInstance.patch(API.IMAGES.REARRANGE, payload);
                console.log(result);
                return result.data;
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    return rejectWithValue(error.response?.data?.message || "Invalid request");
                }
                return rejectWithValue("Something went wrong. Please try again.");
            }
        }
    
    )

    export const updateImageTitle = createAsyncThunk(
        "/images/updateTitle",
        async (payload: { imageId: string; title: string }, { rejectWithValue }) => {  
            try {
                const {imageId,title}= payload
                const result = await axiosInstance.patch(`/images/${imageId}/title`, { title });
                console.log(result);
                return result.data;
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    return rejectWithValue(error.response?.data?.message || "Invalid request");
                }
                return rejectWithValue("Something went wrong. Please try again.");
            }
        }
    
    )

    export const updateImageFile = createAsyncThunk(
        "/images/updateFile",
        async (payload: { imageId: string; data: FormData }, { rejectWithValue }) => {  
            try {
                const {imageId,data}= payload
                
                const result = await axiosInstance.patch(`/images/${imageId}/file`, data);
                console.log(result);
                return result.data;
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    return rejectWithValue(error.response?.data?.message || "Invalid request");
                }
                return rejectWithValue("Something went wrong. Please try again.");
            }
        }
    
    )

    export const deleteImage = createAsyncThunk(
        "/images/delete",
        async (payload: { imageId: string }, { rejectWithValue }) => {  
            try {
                const {imageId}= payload    
                const result = await axiosInstance.delete(`/images/${imageId}`);
                console.log(result);
                return result.data;
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    return rejectWithValue(error.response?.data?.message || "Invalid request");
                }
                return rejectWithValue("Something went wrong. Please try again.");
            }
        }
    
    )
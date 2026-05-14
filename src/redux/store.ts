import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/es/storage";
import { persistReducer,persistStore } from "redux-persist";
import userSlice from './slices/userSlice';


const rootReducer=combineReducers({
    user:userSlice,
})


const persistConfig={
    key:'root',
    storage,
    whitelist:["user"]
};

const persistedReducer=persistReducer(persistConfig,rootReducer)

export const store= configureStore({
    reducer:persistedReducer,
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware({
        serializableCheck:false
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
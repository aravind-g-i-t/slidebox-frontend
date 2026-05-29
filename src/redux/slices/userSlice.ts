import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types/authTypes";



interface IUserState {
    user:User |null
}

const initialState: IUserState = {
    user: null
}


const userSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearUser: (state) => {
            Object.assign(state, initialState)
        },
        setUser:(state,action)=>{
            state.user=action.payload
        }
    },

});



export const { clearUser,setUser } = userSlice.actions;
export default userSlice.reducer;
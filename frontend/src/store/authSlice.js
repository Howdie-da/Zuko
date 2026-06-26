import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    isAuthenticated: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCreds: (state, action) => {
            state.user = action.payload.user
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null,
            state.isAuthenticated = false;
        }
    }
})

export const { setCreds, logout } = authSlice.actions;
export default authSlice.reducer;
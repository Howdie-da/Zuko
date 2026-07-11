import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    profile: null
}

const statsSlice = createSlice({
    name: "stats",
    initialState,
    reducers: {
        loadProfile: (state, action) => {
            state.profile = action.payload
        }
    }
})

export const { loadProfile } = statsSlice.actions
export default statsSlice.reducer
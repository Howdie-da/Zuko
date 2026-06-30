import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    animeList: []
}

const scheduleSlice = createSlice({
    name: "schedule",
    initialState,
    reducers: {
        loadSchedule: (state, action) => {
            state.animeList = action.payload
        }
    }
})

export const { loadSchedule } = scheduleSlice.actions
export default scheduleSlice.reducer
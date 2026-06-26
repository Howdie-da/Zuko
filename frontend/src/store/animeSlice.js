import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    watching: [],
    completed: [],
    on_hold: [],
    dropped: [],
    plan_to_watch: [],
    status: false
}

const animeSlice = createSlice({
    name: "anime",
    initialState,
    reducers: {
        setList: (state, action) => {
            const sortedData = action.payload?.data || {}

            state.watching = sortedData.watching || []
            state.completed = sortedData.completed || []
            state.on_hold = sortedData.on_hold || []
            state.dropped = sortedData.dropped || []
            state.plan_to_watch = sortedData.plan_to_watch || []
            state.status = true
        },
        clearAll: (state) => {
            state.watching = []
            state.completed = []
            state.on_hold = []
            state.dropped = []
            state.plan_to_watch = []
            state.status = false
        }
    }
})

export const { setList, clearAll } = animeSlice.actions
export default animeSlice.reducer
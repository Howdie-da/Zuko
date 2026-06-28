import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    watching: [],
    completed: [],
    on_hold: [],
    dropped: [],
    plan_to_watch: [],
    status: false,

    listScrollPosition: 0,
    discoverScrollPosition: 0
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
        },
        setListScrollPosition: (state, action) => {
            state.listScrollPosition = action.payload
        },
        setDiscoverScrollPosition: (state, action) => {
            state.discoverScrollPosition = action.payload
        },
    }
})

export const { setList, clearAll, setListScrollPosition, setDiscoverScrollPosition } = animeSlice.actions
export default animeSlice.reducer
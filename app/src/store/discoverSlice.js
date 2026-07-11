import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    feeds: null,
    lastFetched: null
}

const discoverSlice = createSlice({
    name: "discover",
    initialState,
    reducers: {
    setDiscoverData: (state, action) => {
      state.feeds = action.payload
      state.lastFetched = Date.now()
    },
    clearDiscoverCache: (state) => {
      state.feeds = null
      state.lastFetched = null
    }
  }
})

export const { setDiscoverData, clearDiscoverCache } = discoverSlice.actions
export default discoverSlice.reducer
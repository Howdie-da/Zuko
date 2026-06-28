import { configureStore } from '@reduxjs/toolkit'
import authSliceReducer from './authSlice.js'
import animeSliceReducer from './animeSlice.js'
import discoverSliceReducer from './discoverSlice.js'

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        anime: animeSliceReducer,
        discover: discoverSliceReducer
    }
})

export { store }
import { configureStore } from '@reduxjs/toolkit'
import authSliceReducer from './authSlice.js'
import animeSliceReducer from './animeSlice.js'

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        anime: animeSliceReducer
    }
})

export { store }
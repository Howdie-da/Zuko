import { configureStore } from '@reduxjs/toolkit'
import authSliceReducer from './authSlice.js'
import animeSliceReducer from './animeSlice.js'
import discoverSliceReducer from './discoverSlice.js'
import scheduleSliceReducer from './scheduleSlice.js'
import statsSliceReducer from './statsSlice.js'

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        anime: animeSliceReducer,
        discover: discoverSliceReducer,
        schedule: scheduleSliceReducer,
        stats: statsSliceReducer
    }
})

export { store }
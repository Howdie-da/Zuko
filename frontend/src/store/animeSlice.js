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
        editAnimeInState: (state, action) => {
            const { animeId, updatedFields } = action.payload
            const subLists = ['watching', 'plan_to_watch', 'on_hold', 'completed', 'dropped']
            
            let targetItem = null

            for (const listKey of subLists) {
                const idx = state[listKey].findIndex(item => item.node.id === animeId)
                if (idx !== -1) {
                    const [extractedItem] = state[listKey].splice(idx, 1)
                    targetItem = JSON.parse(JSON.stringify(extractedItem))
                    break
                }
            }

            if (targetItem) {
                targetItem.node.my_list_status = {
                ...targetItem.node.my_list_status,
                ...updatedFields
                }

                const destinationKey = updatedFields.status || targetItem.node.my_list_status.status
                state[destinationKey].unshift(targetItem)
            }
        },
        addAnimeToState: (state, action) => {
            const { animeData, updatedFields } = action.payload
            
            const newEntry = {
                node: {
                    id: animeData.id,
                    synopsis: animeData.synopsis,
                    title: animeData.title,
                    main_picture: animeData.main_picture,
                    num_episodes: animeData.totalEp || animeData.num_episodes || 0,
                    mean: animeData.rating || animeData.mean || '?',
                    start_date: animeData.airingStart,
                    end_date: animeData.airingEnd,
                    my_list_status: {
                        num_episodes_watched: updatedFields.num_episodes_watched,
                        score: updatedFields.score,
                        status: updatedFields.status
                    }
                },
            }

            const destinationKey = updatedFields.status || 'plan_to_watch'

            const alreadyExists = state[destinationKey].some(item => item.node.id === animeData.id)

            if (!alreadyExists) {
                state[destinationKey].unshift(newEntry)
            }
        },
        deleteAnimeFromState: (state, action) => {
            const { animeId } = action.payload
            const subLists = ['watching', 'plan_to_watch', 'on_hold', 'completed', 'dropped']

            for (const listKey of subLists) {
                const idx = state[listKey].findIndex(item => item.node.id === animeId)
                
                if (idx !== -1) {
                    state[listKey].splice(idx, 1)
                    break
                }
            }
        }
    }
})

export const { setList, clearAll, setListScrollPosition, setDiscoverScrollPosition, editAnimeInState, addAnimeToState, deleteAnimeFromState } = animeSlice.actions
export default animeSlice.reducer
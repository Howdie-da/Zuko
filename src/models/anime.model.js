import mongoose from 'mongoose'

const animeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    animeId: { 
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['watching', 'completed', 'onHold', 'dropped', 'planToWatch'],
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    episodesWatched: {
        type: Number,
        default: 0
    }
});

animeSchema.index({ userId: 1, animeId: 1 }, { unique: true });

export const Anime = mongoose.model('Anime', animeSchema);
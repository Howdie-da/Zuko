import mongoose from 'mongoose'

export const User = mongoose.model('User', new mongoose.Schema({
    malId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    accessToken: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    tokenExpiresAt: {
        type: Date,
        default: null
    }
})) 
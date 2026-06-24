import { Router } from 'express'
import { getAnimeDetails, getSeasonal, searchAnime } from '../controllers/anime.controller.js'

const animeRouter = Router()

animeRouter.route("/search").get(searchAnime)

animeRouter.route("/anime").get(getAnimeDetails)

animeRouter.route("/season").get(getSeasonal)

export {
    animeRouter
}
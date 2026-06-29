import { Router } from 'express'
import { edit, getAnimeDetails, getDiscover, getList, getSeasonal, searchAnime } from '../controllers/anime.controller.js'

const animeRouter = Router()

animeRouter.route("/search").get(searchAnime)

animeRouter.route("/anime").get(getAnimeDetails)

animeRouter.route("/season").get(getSeasonal)

animeRouter.route("/my-list").get(getList)

animeRouter.route("/discover").get(getDiscover)

animeRouter.route("/edit").patch(edit)

export {
    animeRouter
}
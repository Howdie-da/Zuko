import { Router } from 'express'
import { deleteAnime, edit, getAnimeDetails, getDiscover, getList, getSeasonal, searchAnime } from '../controllers/anime.controller.js'
import { refreshMALToken } from '../middlewares/refreshMALToken.middleware.js'

const animeRouter = Router()

animeRouter.route("/search").get(searchAnime)

animeRouter.route("/anime").get(getAnimeDetails)

animeRouter.route("/season").get(getSeasonal)

animeRouter.route("/my-list").get(refreshMALToken, getList)

animeRouter.route("/discover").get(getDiscover)

animeRouter.route("/edit").patch(refreshMALToken, edit)

animeRouter.route("/delete").delete(refreshMALToken, deleteAnime)

animeRouter.route("/schedule").get(getSeasonal)

export {
    animeRouter
}
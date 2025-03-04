import express from 'express';
import favoriteService from '../service/FavoriteService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import { auth } from '../security/authenticate.js';
import FavoritesPaths from '../security/FavoritesPaths.js';

const favoritesRouter = express.Router();

favoritesRouter.post('/favorite', auth(FavoritesPaths), validateBody(schemas.schemaPostFavorite), async (req, res) => {
    try {
        const favorite = await favoriteService.addFavorite(req.body);
        res.status(201).send(favorite);
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

favoritesRouter.get('/:email', validateParam(schemas.schemaEmail), auth(FavoritesPaths), async (req, res) => {
    try {
        const favorites = await favoriteService.getFavoritesByEmail(req.params.email);
        res.status(200).send(favorites);
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

favoritesRouter.put('/favorite', validateBody(schemas.schemaUpdateFavorite), auth(FavoritesPaths), async (req, res) => {
    try {
        const favorite = await favoriteService.updateFavorite(req.body.id, req.body.viewed, req.body.feedback);
        res.status(200).send(favorite);
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

favoritesRouter.delete('/favorite', validateBody(schemas.schemaDeleteFavorite), auth(FavoritesPaths), async (req, res) => {
    try {
        const favorite = await favoriteService.deleteFavorite(req.body.id, req.body.email);
        res.status(200).send(favorite);
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

export default favoritesRouter;
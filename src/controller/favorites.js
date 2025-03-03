import express from 'express';
import favoriteService from '../service/FavoriteService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';

const favoritesRouter = express.Router();

favoritesRouter.post('/favorite', validateBody(schemas.schemaPostFavorite), async (req, res) => {
    try {
        const favorite = await favoriteService.addFavorite(req.body);
        res.status(201).send(favorite);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

favoritesRouter.get('/:email', validateParam(schemas.schemaEmail), async (req, res) => {
    try {
        const favorites = await favoriteService.getFavoritesByEmail(req.params.email);
        res.status(200).send(favorites);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

favoritesRouter.put('/favorite', validateBody(schemas.schemaUpdateFavorite), async (req, res) => {
    try {
        const favorite = await favoriteService.updateFavorite(req.body.id, req.body.viewed, req.body.feedback);
        res.status(200).send(favorite);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

favoritesRouter.delete('/favorite', validateBody(schemas.schemaDeleteFavorite), async (req, res) => {
    try {
        const favorite = await favoriteService.deleteFavorite(req.body.id, req.body.email);
        res.status(200).send(favorite);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

export default favoritesRouter;
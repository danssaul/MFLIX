import express from 'express';
import favoriteService from '../service/FavoriteService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import { auth } from '../security/authenticate.js';
import FavoritesPaths from '../security/FavoritesPaths.js';
import asyncHandler from "express-async-handler";

const favoritesRouter = express.Router();

favoritesRouter.post('/favorite', auth(FavoritesPaths), validateBody(schemas.schemaPostFavorite), asyncHandler(async (req, res) => {
    const favorite = await favoriteService.addFavorite(req.body);
    res.status(201).send(favorite);
}));

favoritesRouter.get('/:email', validateParam(schemas.schemaEmail), auth(FavoritesPaths), asyncHandler(async (req, res) => {
    const favorites = await favoriteService.getFavoritesByEmail(req.params.email);
    res.status(200).send(favorites);
}));

favoritesRouter.put('/favorite', validateBody(schemas.schemaUpdateFavorite), auth(FavoritesPaths), asyncHandler(async (req, res) => {
    const favorite = await favoriteService.updateFavorite(req.body.id, req.body.viewed, req.body.feedback);
    res.status(200).send(favorite);
}));

favoritesRouter.delete('/favorite', validateBody(schemas.schemaDeleteFavorite), auth(FavoritesPaths), asyncHandler(async (req, res) => {
    const favorite = await favoriteService.deleteFavorite(req.body.id, req.body.email);
    res.status(200).send(favorite);
}));

export default favoritesRouter;
import express from 'express';
import favoriteService from '../service/FavoriteService.js';

const favoritesRouter = express.Router();

favoritesRouter.post('/favorite', async (req, res) => {
    try {
        const favorite = await favoriteService.addFavorite(req.body);
        res.status(201).send(favorite);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

favoritesRouter.get('/:email', async (req, res) => {
    try {
        const favorites = await favoriteService.getFavoritesByEmail(req.params.email);
        res.status(200).send(favorites);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

favoritesRouter.put('/favorite', async (req, res) => {
    try {
        const favorite = await favoriteService.updateFavorite(req.body._id, req.body.viewed, req.body.feedback);
        res.status(200).send(favorite);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

favoritesRouter.delete('/favorite', async (req, res) => {
    try {
        const favorite = await favoriteService.deleteFavorite(req.body.id, req.body.email);
        res.status(200).send(favorite);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

export default favoritesRouter;
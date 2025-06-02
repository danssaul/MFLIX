import express from 'express';
import favoriteService from '../service/FavoriteService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import { auth } from '../security/authenticate.js';
import FavoritesPaths from '../security/FavoritesPaths.js';
import asyncHandler from "express-async-handler";

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Movie favorites management endpoints
 * 
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *           description: MongoDB ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the user who favorited the movie
 *           example: john.doe@example.com
 *         movie_id:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *           description: MongoDB ObjectId of the movie
 *           example: 507f1f77bcf86cd799439012
 *         feedback:
 *           type: string
 *           description: User's feedback about the movie
 *           example: One of my all-time favorites!
 *         viewed:
 *           type: boolean
 *           description: Whether the user has watched the movie
 *           example: true
 *         date_added:
 *           type: string
 *           format: date-time
 *           description: Date when the movie was added to favorites
 *           example: "2024-03-15T14:30:00Z"
 */

const favoritesRouter = express.Router();

/**
 * @swagger
 * /favorites/favorite:
 *   post:
 *     summary: Add movie to favorites
 *     description: Adds a movie to user's favorites list. Requires authentication.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - movie_id
 *               - feedback
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               movie_id:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 example: 507f1f77bcf86cd799439012
 *               feedback:
 *                 type: string
 *                 example: One of my all-time favorites!
 *           examples:
 *             newFavorite:
 *               summary: Example of adding a new favorite
 *               value:
 *                 email: john.doe@example.com
 *                 movie_id: 507f1f77bcf86cd799439012
 *                 feedback: One of my all-time favorites!
 *     responses:
 *       201:
 *         description: Movie added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *             examples:
 *               success:
 *                 summary: Example of successful response
 *                 value:
 *                   id: 507f1f77bcf86cd799439011
 *                   email: john.doe@example.com
 *                   movie_id: 507f1f77bcf86cd799439012
 *                   feedback: One of my all-time favorites!
 *                   viewed: false
 *                   date_added: "2024-03-15T14:30:00Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               invalidFormat:
 *                 summary: Example of invalid format error
 *                 value:
 *                   message: "Invalid input format"
 *               duplicateFavorite:
 *                 summary: Example of duplicate favorite error
 *                 value:
 *                   message: "Movie already in favorites"
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
 */
favoritesRouter.post('/favorite', auth(FavoritesPaths), validateBody(schemas.schemaPostFavorite), asyncHandler(async (req, res) => {
    const favorite = await favoriteService.addFavorite(req.body);
    res.status(201).send(favorite);
}));

/**
 * @swagger
 * /favorites/{email}:
 *   get:
 *     summary: Get user's favorites
 *     description: Retrieves all favorite movies for a specific user. Requires authentication.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user whose favorites to retrieve
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: List of favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *             examples:
 *               multipleFavorites:
 *                 summary: Example of multiple favorites
 *                 value:
 *                   - id: 507f1f77bcf86cd799439011
 *                     email: john.doe@example.com
 *                     movie_id: 507f1f77bcf86cd799439012
 *                     feedback: One of my all-time favorites!
 *                     viewed: true
 *                     date_added: "2024-03-15T14:30:00Z"
 *                   - id: 507f1f77bcf86cd799439013
 *                     email: john.doe@example.com
 *                     movie_id: 507f1f77bcf86cd799439014
 *                     feedback: Can't wait to watch this one
 *                     viewed: false
 *                     date_added: "2024-03-16T10:15:00Z"
 *               noFavorites:
 *                 summary: Example when user has no favorites
 *                 value: []
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
 *       404:
 *         description: No favorites found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "No favorites found for this user"
 */
favoritesRouter.get('/:email', validateParam(schemas.schemaEmail), auth(FavoritesPaths), asyncHandler(async (req, res) => {
    const favorites = await favoriteService.getFavoritesByEmail(req.params.email);
    res.status(200).send(favorites);
}));

/**
 * @swagger
 * /favorites/favorite:
 *   put:
 *     summary: Update favorite movie details
 *     description: Updates the viewed status and feedback for a favorite movie. Requires authentication.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 example: 507f1f77bcf86cd799439011
 *               viewed:
 *                 type: boolean
 *                 example: true
 *               feedback:
 *                 type: string
 *                 example: Even better on second watch!
 *           examples:
 *             updateViewed:
 *               summary: Example of updating viewed status
 *               value:
 *                 id: 507f1f77bcf86cd799439011
 *                 viewed: true
 *             updateFeedback:
 *               summary: Example of updating feedback
 *               value:
 *                 id: 507f1f77bcf86cd799439011
 *                 feedback: Even better on second watch!
 *             updateBoth:
 *               summary: Example of updating both viewed and feedback
 *               value:
 *                 id: 507f1f77bcf86cd799439011
 *                 viewed: true
 *                 feedback: Even better on second watch!
 *     responses:
 *       200:
 *         description: Favorite updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *             examples:
 *               success:
 *                 summary: Example of successful update
 *                 value:
 *                   id: 507f1f77bcf86cd799439011
 *                   email: john.doe@example.com
 *                   movie_id: 507f1f77bcf86cd799439012
 *                   feedback: Even better on second watch!
 *                   viewed: true
 *                   date_added: "2024-03-15T14:30:00Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Invalid input format"
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Favorite not found"
 */
favoritesRouter.put('/favorite', validateBody(schemas.schemaUpdateFavorite), auth(FavoritesPaths), asyncHandler(async (req, res) => {
    const favorite = await favoriteService.updateFavorite(req.body.id, req.body.viewed, req.body.feedback);
    res.status(200).send(favorite);
}));

/**
 * @swagger
 * /favorites/favorite:
 *   delete:
 *     summary: Remove movie from favorites
 *     description: Removes a movie from user's favorites list. Requires authentication.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - email
 *             properties:
 *               id:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 example: 507f1f77bcf86cd799439011
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *           example:
 *             id: 507f1f77bcf86cd799439011
 *             email: john.doe@example.com
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *             examples:
 *               success:
 *                 summary: Example of successfully removed favorite
 *                 value:
 *                   id: 507f1f77bcf86cd799439011
 *                   email: john.doe@example.com
 *                   movie_id: 507f1f77bcf86cd799439012
 *                   feedback: One of my all-time favorites!
 *                   viewed: true
 *                   date_added: "2024-03-15T14:30:00Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Invalid input format"
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Favorite not found"
 */
favoritesRouter.delete('/favorite', validateBody(schemas.schemaDeleteFavorite), auth(FavoritesPaths), asyncHandler(async (req, res) => {
    const favorite = await favoriteService.deleteFavorite(req.body.id, req.body.email);
    res.status(200).send(favorite);
}));

export default favoritesRouter;
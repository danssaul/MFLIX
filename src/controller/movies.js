import express from 'express';
import movieService from '../service/MovieService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import { auth } from '../security/authenticate.js';
import MoviesPaths from '../security/MoviesPaths.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import asyncHandler from "express-async-handler";
import { reqLimiter } from '../middleware/reqLimiter.js';

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management and search endpoints
 * 
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *           description: MongoDB ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         title:
 *           type: string
 *           description: Movie title
 *           example: The Shawshank Redemption
 *         year:
 *           type: integer
 *           description: Release year
 *           example: 1994
 *         imdb:
 *           type: integer
 *           description: IMDB ID
 *           example: 111161
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 10
 *           description: Average user rating
 *           example: 9.3
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           description: Movie genres
 *           example: ["Drama", "Crime"]
 *         actors:
 *           type: array
 *           items:
 *             type: string
 *           description: Main actors
 *           example: ["Tim Robbins", "Morgan Freeman"]
 *         language:
 *           type: string
 *           description: Movie language
 *           example: English
 */

const moviesRouter = express.Router();
moviesRouter.use(auth(MoviesPaths));

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     description: Retrieves detailed information about a specific movie. Requires authentication and is rate limited.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: MongoDB ObjectId of the movie
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Movie details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *             examples:
 *               success:
 *                 summary: Example of a movie
 *                 value:
 *                   id: 507f1f77bcf86cd799439011
 *                   title: The Shawshank Redemption
 *                   year: 1994
 *                   imdb: 111161
 *                   rating: 9.3
 *                   genres: ["Drama", "Crime"]
 *                   actors: ["Tim Robbins", "Morgan Freeman"]
 *                   language: English
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
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Movie not found"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Too many requests. Please try again later."
 */
moviesRouter.get('/:id', validateParam(schemas.schemaId), reqLimiter, asyncHandler(async (req, res) => {
    const movie = await movieService.getMovieByID(req.params.id);
    res.send(movie).status(200);
}));

/**
 * @swagger
 * /movies/most-rated:
 *   post:
 *     summary: Get most rated movies by filter
 *     description: Retrieves a list of most rated movies based on various filters. Requires authentication and is rate limited.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Filter by release year
 *                 example: 1994
 *               actor:
 *                 type: string
 *                 description: Filter by actor name
 *                 example: Morgan Freeman
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Filter by genres
 *                 example: ["Drama", "Crime"]
 *               language:
 *                 type: string
 *                 description: Filter by language
 *                 example: English
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of movies to return
 *                 example: 10
 *           examples:
 *             allFilters:
 *               summary: Example with all filters
 *               value:
 *                 year: 1994
 *                 actor: Morgan Freeman
 *                 genres: ["Drama", "Crime"]
 *                 language: English
 *                 amount: 10
 *             minimalFilters:
 *               summary: Example with minimal filters
 *               value:
 *                 amount: 5
 *     responses:
 *       200:
 *         description: List of movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *             examples:
 *               success:
 *                 summary: Example of movie list
 *                 value:
 *                   - id: 507f1f77bcf86cd799439011
 *                     title: The Shawshank Redemption
 *                     year: 1994
 *                     imdb: 111161
 *                     rating: 9.3
 *                     genres: ["Drama", "Crime"]
 *                     actors: ["Tim Robbins", "Morgan Freeman"]
 *                     language: English
 *                   - id: 507f1f77bcf86cd799439012
 *                     title: The Godfather
 *                     year: 1972
 *                     imdb: 111162
 *                     rating: 9.2
 *                     genres: ["Crime", "Drama"]
 *                     actors: ["Marlon Brando", "Al Pacino"]
 *                     language: English
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
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Too many requests. Please try again later."
 */
moviesRouter.post('/most-rated', validateBody(schemas.schemaMostRatedAndCommented), reqLimiter, asyncHandler(async (req, res) => {
    const { year, actor, genres, language, amount } = req.body;
    const movies = await movieService.getMostRatedMoviesByFilter({ year, actor, genres, language, amount });
    res.status(200).send(movies);
}));

/**
 * @swagger
 * /movies/most-commented:
 *   post:
 *     summary: Get most commented movies by filter
 *     description: Retrieves a list of most commented movies based on various filters. Requires authentication and is rate limited.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Filter by release year
 *                 example: 1994
 *               actor:
 *                 type: string
 *                 description: Filter by actor name
 *                 example: Morgan Freeman
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Filter by genres
 *                 example: ["Drama", "Crime"]
 *               language:
 *                 type: string
 *                 description: Filter by language
 *                 example: English
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of movies to return
 *                 example: 10
 *           examples:
 *             allFilters:
 *               summary: Example with all filters
 *               value:
 *                 year: 1994
 *                 actor: Morgan Freeman
 *                 genres: ["Drama", "Crime"]
 *                 language: English
 *                 amount: 10
 *             genreFilter:
 *               summary: Example with genre filter
 *               value:
 *                 genres: ["Action", "Adventure"]
 *                 amount: 5
 *     responses:
 *       200:
 *         description: List of movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *             examples:
 *               success:
 *                 summary: Example of movie list
 *                 value:
 *                   - id: 507f1f77bcf86cd799439011
 *                     title: The Dark Knight
 *                     year: 2008
 *                     imdb: 111163
 *                     rating: 9.0
 *                     genres: ["Action", "Crime", "Drama"]
 *                     actors: ["Christian Bale", "Heath Ledger"]
 *                     language: English
 *                   - id: 507f1f77bcf86cd799439014
 *                     title: Inception
 *                     year: 2010
 *                     imdb: 111164
 *                     rating: 8.8
 *                     genres: ["Action", "Adventure", "Sci-Fi"]
 *                     actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
 *                     language: English
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
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Too many requests. Please try again later."
 */
moviesRouter.post('/most-commented', validateBody(schemas.schemaMostRatedAndCommented), reqLimiter, asyncHandler(async (req, res) => {
    const { year, actor, genres, language, amount } = req.body;
    const movies = await movieService.getMostCommentedMoviesByFilter({ year, actor, genres, language, amount });
    res.status(200).send(movies);
}));

/**
 * @swagger
 * /movies/{imdb}:
 *   patch:
 *     summary: Update movie rating
 *     description: Updates the rating of a movie. Requires authentication and has rate limiting.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imdb
 *         required: true
 *         schema:
 *           type: integer
 *         description: IMDB ID of the movie
 *         example: 111161
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - email
 *             properties:
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 10
 *                 description: New rating for the movie
 *                 example: 9.5
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user rating the movie
 *                 example: john.doe@example.com
 *           examples:
 *             highRating:
 *               summary: Example of high rating
 *               value:
 *                 rating: 9.5
 *                 email: john.doe@example.com
 *             lowRating:
 *               summary: Example of low rating
 *               value:
 *                 rating: 3.5
 *                 email: jane.smith@example.com
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Movie updated successfully"
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
 *               invalidRating:
 *                 summary: Example of invalid rating
 *                 value:
 *                   message: "Rating must be between 1 and 10"
 *               invalidFormat:
 *                 summary: Example of invalid format
 *                 value:
 *                   message: "Invalid input format"
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
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Movie not found"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Too many rating attempts. Please try again later."
 */
moviesRouter.patch('/:imdb', validateBody(schemas.schemaUpdateMovieRating), rateLimiter, validateParam(schemas.schemaImdbId), asyncHandler(async (req, res) => {
    const { rating, email } = req.body;
    const imdb = parseInt(req.params.imdb);
    await movieService.updateMovieRating(imdb, rating, email);
    res.status(200).send({ message: 'Movie updated successfully' });
}));

export default moviesRouter;
import express from 'express';
import movieService from '../service/MovieService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import { auth } from '../security/authenticate.js';
import MoviesPaths from '../security/MoviesPaths.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const moviesRouter = express.Router();

moviesRouter.use(auth(MoviesPaths));
moviesRouter.use(rateLimiter);

moviesRouter.get('/:id', validateParam(schemas.schemaId), async (req, res) => {
    try {
        const movie = await movieService.getMovieByID(req.params.id);
        res.send(movie).status(200);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

moviesRouter.post('/most-rated', validateBody(schemas.schemaMostRatedAndCommented), async (req, res) => {
    try {
        const { year, actor, genres, language, amount } = req.body;
        const movies = await movieService.getMostRatedMoviesByFilter({ year, actor, genres, language, amount });
        res.status(200).send(movies);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

moviesRouter.post('/most-commented', validateBody(schemas.schemaMostRatedAndCommented), async (req, res) => {
    try {
        const { year, actor, genres, language, amount } = req.body;
        const movies = await movieService.getMostCommentedMoviesByFilter({ year, actor, genres, language, amount });
        res.status(200).send(movies);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

moviesRouter.patch('/:imdb', rateLimiter, validateBody(schemas.schemaUpdateMovieRating), validateParam(schemas.schemaImdbId), async (req, res) => {
    try {
        const { rating, email} = req.body;
        const imdb = parseInt(req.params.imdb);

        await movieService.updateMovieRating(imdb, rating, email);

        res.status(200).send({ message: 'Movie updated successfully' });
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

export default moviesRouter;
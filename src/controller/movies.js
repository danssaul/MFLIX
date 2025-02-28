import express from 'express';
import movieService from '../service/MovieService.js';

const moviesRouter = express.Router();

moviesRouter.get('/:id', async (req, res) => {
    try {
        const movie = await movieService.getMovieByID(req.params.id);
        res.send(movie).status(200);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

moviesRouter.post('/most-rated', async (req, res) => {
    try {
        const { year, actor, genres, language, amount } = req.body;
        const movies = await movieService.getMostRatedMoviesByFilter({ year, actor, genres, language, amount });
        res.status(200).send(movies);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

moviesRouter.post('/most-commented', async (req, res) => {
    try {
        const { year, actor, genres, language, amount } = req.body;
        const movies = await movieService.getMostCommentedMoviesByFilter({ year, actor, genres, language, amount });
        res.status(200).send(movies);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

moviesRouter.patch('/:imdb', async (req, res) => {
    try {
        const { rating, email} = req.body;
        const imdb = parseInt(req.params.imdb);

        await movieService.updateMovieRating(imdb, rating, email);

        res.status(200).send({ message: 'Movie updated successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

export default moviesRouter;
import express from 'express';
import commentService from '../service/CommentsService.js';

const commentsRouter = new express.Router();

commentsRouter.post('/comment', async (req, res) => {
    try {
        const newComment = await commentService.addComment(req.body);
        res.status(201).send(newComment);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

commentsRouter.get('/comment/:id', async (req, res) => {
    try {
        const comments = await commentService.getCommentsByMovieID(req.params.id);
        res.status(200).send(comments);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

commentsRouter.post('/', async (req, res) => {
    try {
        const updatedComment = await commentService.updateComment(req.body.id, req.body.text)
        res.status(200).send(updatedComment);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

commentsRouter.get('/:email', async (req, res) => {
    try {
        const comments = await commentService.getCommentsByEmail(req.params.email);
        res.status(200).send(comments);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

commentsRouter.delete('/comment/:id', async (req, res) => {
    try {
        const deletedComment = await commentService.deleteCommentByID(req.params.id);
        res.status(200).send(deletedComment);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

export default commentsRouter;
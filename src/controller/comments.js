import express from 'express';
import commentService from '../service/CommentsService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';

const commentsRouter = new express.Router();

commentsRouter.post('/comment', validateBody(schemas.schemaPostComment), async (req, res) => {
    try {
        const newComment = await commentService.addComment(req.body);
        res.status(201).send(newComment);
    } catch (error) {
        res.status(error.status).send({ error: error.message });
    }
});

commentsRouter.get('/comment/:id', validateParam(schemas.schemaId), async (req, res) => {
    try {
        const comments = await commentService.getCommentsByMovieID(req.params.id);
        res.status(200).send(comments);
    } catch (error) {
        res.status(error.status).send({ error: error.message });
    }
});

commentsRouter.post('/', validateBody(schemas.schemaUpdateComment),  async (req, res) => {
    try {
        const updatedComment = await commentService.updateComment(req.body.id, req.body.text)
        res.status(200).send(updatedComment);
    } catch (error) {
        res.status(error.status).send({ error: error.message });
    }
});

commentsRouter.get('/:email', validateParam(schemas.schemaEmail), async (req, res) => {
    try {
        const comments = await commentService.getCommentsByEmail(req.params.email);
        res.status(200).send(comments);
    } catch (error) {
        res.status(error.status).send({ error: error.message });
    }
});

commentsRouter.delete('/comment/:id', validateParam(schemas.schemaId), async (req, res) => {
    try {
        const deletedComment = await commentService.deleteCommentByID(req.params.id);
        res.status(200).send(deletedComment);
    } catch (error) {
        res.status(error.status).send({ error: error.message });
    }
});

export default commentsRouter;
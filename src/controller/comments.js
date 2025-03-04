import express from 'express';
import commentService from '../service/CommentsService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import CommentsPaths from '../security/CommentsPaths.js';
import { auth } from '../security/authenticate.js';
import asyncHandler from "express-async-handler";

const commentsRouter = new express.Router();

commentsRouter.post('/comment', auth(CommentsPaths), validateBody(schemas.schemaPostComment), asyncHandler(async (req, res) => {
    const newComment = await commentService.addComment(req.body);
    res.status(201).send(newComment);
}));

commentsRouter.get('/comment/:id', validateParam(schemas.schemaId), auth(CommentsPaths), asyncHandler(async (req, res) => {
    const comments = await commentService.getCommentsByMovieID(req.params.id);
    res.status(200).send(comments);
}));

commentsRouter.post('/', validateBody(schemas.schemaUpdateComment), asyncHandler(async (req, res) => {
    const updatedComment = await commentService.updateComment(req.body.id, req.body.text);
    res.status(200).send(updatedComment);
}));

commentsRouter.get('/:email', validateParam(schemas.schemaEmail), asyncHandler(async (req, res) => {
    const comments = await commentService.getCommentsByEmail(req.params.email);
    res.status(200).send(comments);
}));

commentsRouter.delete('/comment/:id', validateParam(schemas.schemaId), auth(CommentsPaths), asyncHandler(async (req, res) => {
    const deletedComment = await commentService.deleteCommentByID(req.params.id);
    res.status(200).send(deletedComment);
}));

export default commentsRouter;
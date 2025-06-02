import express from 'express';
import commentService from '../service/CommentsService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import CommentsPaths from '../security/CommentsPaths.js';
import { auth } from '../security/authenticate.js';
import asyncHandler from "express-async-handler";

const commentsRouter = new express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Movie comments management endpoints
 * 
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *           description: MongoDB ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           pattern: ^[a-zA-Z\s]+$
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         movie_id:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *           description: MongoDB ObjectId of the movie
 *           example: 507f1f77bcf86cd799439012
 *         text:
 *           type: string
 *           description: The comment text
 *           example: Great movie! Really enjoyed the plot twists.
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-15T14:30:00Z"
 */

/**
 * @swagger
 * /comments/comment:
 *   post:
 *     summary: Add a new comment
 *     description: Creates a new comment for a movie. Requires authentication.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - movie_id
 *               - text
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: ^[a-zA-Z\s]+$
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               movie_id:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 example: 507f1f77bcf86cd799439012
 *               text:
 *                 type: string
 *                 example: Great movie! Really enjoyed the plot twists.
 *           example:
 *             username: John Doe
 *             email: john.doe@example.com
 *             movie_id: 507f1f77bcf86cd799439012
 *             text: Great movie! Really enjoyed the plot twists.
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
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
 */

commentsRouter.post('/comment', auth(CommentsPaths), validateBody(schemas.schemaPostComment), asyncHandler(async (req, res) => {
    const newComment = await commentService.addComment(req.body);
    res.status(201).send(newComment);
}));

/**
 * @swagger
 * /comments/comment/{id}:
 *   get:
 *     summary: Get comments by movie ID
 *     description: Retrieves all comments for a specific movie. Requires authentication.
 *     tags: [Comments]
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
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *             example:
 *               - id: 507f1f77bcf86cd799439011
 *                 username: John Doe
 *                 email: john.doe@example.com
 *                 movie_id: 507f1f77bcf86cd799439012
 *                 text: Great movie! Really enjoyed the plot twists.
 *                 date: "2024-03-15T14:30:00Z"
 *               - id: 507f1f77bcf86cd799439013
 *                 username: Jane Smith
 *                 email: jane.smith@example.com
 *                 movie_id: 507f1f77bcf86cd799439012
 *                 text: Amazing cinematography and acting!
 *                 date: "2024-03-15T15:45:00Z"
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
 */

commentsRouter.get('/comment/:id', validateParam(schemas.schemaId), auth(CommentsPaths), asyncHandler(async (req, res) => {
    const comments = await commentService.getCommentsByMovieID(req.params.id);
    res.status(200).send(comments);
}));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Update a comment
 *     description: Updates the text of an existing comment. Requires authentication.
 *     tags: [Comments]
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
 *               - text
 *             properties:
 *               id:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 example: 507f1f77bcf86cd799439011
 *               text:
 *                 type: string
 *                 example: Updated review - Even better on second watch!
 *           example:
 *             id: 507f1f77bcf86cd799439011
 *             text: Updated review - Even better on second watch!
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
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
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Comment not found"
 */

commentsRouter.post('/', validateBody(schemas.schemaUpdateComment), auth(CommentsPaths), asyncHandler(async (req, res) => {
    const updatedComment = await commentService.updateComment(req.body.id, req.body.text);
    res.status(200).send(updatedComment);
}));

/**
 * @swagger
 * /comments/{email}:
 *   get:
 *     summary: Get comments by email
 *     description: Retrieves all comments made by a specific user.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user whose comments to retrieve
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *             example:
 *               - id: 507f1f77bcf86cd799439011
 *                 username: John Doe
 *                 email: john.doe@example.com
 *                 movie_id: 507f1f77bcf86cd799439012
 *                 text: Great movie! Really enjoyed the plot twists.
 *                 date: "2024-03-15T14:30:00Z"
 *               - id: 507f1f77bcf86cd799439014
 *                 username: John Doe
 *                 email: john.doe@example.com
 *                 movie_id: 507f1f77bcf86cd799439015
 *                 text: Another fantastic film!
 *                 date: "2024-03-16T10:15:00Z"
 *       404:
 *         description: No comments found for this email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "No comments found"
 */

commentsRouter.get('/:email', validateParam(schemas.schemaEmail), asyncHandler(async (req, res) => {
    const comments = await commentService.getCommentsByEmail(req.params.email);
    res.status(200).send(comments);
}));

/**
 * @swagger
 * /comments/comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes a specific comment by its ID. Requires authentication.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: MongoDB ObjectId of the comment to delete
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *             example:
 *               id: 507f1f77bcf86cd799439011
 *               username: John Doe
 *               email: john.doe@example.com
 *               movie_id: 507f1f77bcf86cd799439012
 *               text: Great movie! Really enjoyed the plot twists.
 *               date: "2024-03-15T14:30:00Z"
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
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Comment not found"
 */

commentsRouter.delete('/comment/:id', validateParam(schemas.schemaId), auth(CommentsPaths), asyncHandler(async (req, res) => {
    const deletedComment = await commentService.deleteCommentByID(req.params.id);
    res.status(200).send(deletedComment);
}));

export default commentsRouter;
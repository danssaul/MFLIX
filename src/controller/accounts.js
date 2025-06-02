import express from 'express';
import service from '../service/AccountService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import AccountPaths from '../security/AccountPaths.js';
import { auth } from '../security/authenticate.js';
import { createError } from '../utils/error.js';
import asyncHandler from "express-async-handler"

const accountsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management and authentication endpoints
 * 
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         username:
 *           type: string
 *           pattern: ^[a-zA-Z\s]+$
 *           minLength: 3
 *           maxLength: 30
 *           example: John Doe
 *         role:
 *           type: string
 *           enum: [user, admin, premium_user]
 *           example: user
 *         blocked:
 *           type: boolean
 *           example: false
 *       example:
 *         email: john.doe@example.com
 *         username: John Doe
 *         role: user
 *         blocked: false
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       example:
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *           example: Operation completed successfully
 *       example:
 *         message: Operation completed successfully
 */

/**
 * @swagger
 * /accounts/user:
 *   post:
 *     summary: Create a new user account
 *     description: Creates a new user account with the provided email, username, and password
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               username:
 *                 type: string
 *                 pattern: ^[a-zA-Z\s]+$
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Must contain only letters and spaces
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain at least 1 special character, 1 lowercase, 1 uppercase, 1 number, no whitespace, only Latin characters
 *                 example: "Password123!"
 *           example:
 *             email: john.doe@example.com
 *             username: John Doe
 *             password: "Password123!"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *             example:
 *               email: john.doe@example.com
 *               username: John Doe
 *               role: user
 *               blocked: false
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
 *               message: "Invalid email format"
 */
accountsRouter.post('/user', validateBody(schemas.schemaPostAccount), asyncHandler(async (req, res) => {
    const newAccount = await service.addUserAccount(req.body);
    res.status(201).send(newAccount);
}));

/**
 * @swagger
 * /accounts/admin:
 *   post:
 *     summary: Create a new admin account
 *     description: Creates a new admin account. Requires admin privileges.
 *     tags: [Accounts]
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
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               username:
 *                 type: string
 *                 pattern: ^[a-zA-Z\s]+$
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Must contain only letters and spaces
 *                 example: Admin User
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain at least 1 special character, 1 lowercase, 1 uppercase, 1 number, no whitespace, only Latin characters
 *                 example: "AdminPass123!"
 *           example:
 *             email: admin@example.com
 *             username: Admin User
 *             password: "AdminPass123!"
 *     responses:
 *       201:
 *         description: Admin account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *             example:
 *               email: admin@example.com
 *               username: Admin User
 *               role: admin
 *               blocked: false
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
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
 *               message: "Password must contain at least one special character"
 */
accountsRouter.post('/admin', validateBody(schemas.schemaPostAccount), auth(AccountPaths), asyncHandler(async (req, res) => {
    const newAccount = await service.addAdminAccount(req.body);
    res.status(201).send(newAccount);
}));

/**
 * @swagger
 * /accounts/{email}:
 *   get:
 *     summary: Get account by email
 *     description: Retrieves account details. Users can only access their own accounts, admins can access any account.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address of the account to retrieve
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *             example:
 *               email: john.doe@example.com
 *               username: John Doe
 *               role: user
 *               blocked: false
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account not found"
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
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
accountsRouter.get('/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.params.email);
    res.send(account);
}));

/**
 * @swagger
 * /accounts/roles/{email}:
 *   patch:
 *     summary: Update account role
 *     description: Updates the role of an account. Requires admin privileges.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the account to update
 *         example: john.doe@example.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, premium_user]
 *                 example: premium_user
 *           example:
 *             role: premium_user
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *             example:
 *               email: john.doe@example.com
 *               username: John Doe
 *               role: premium_user
 *               blocked: false
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
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
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account not found"
 */
accountsRouter.patch('/roles/:email', validateBody(schemas.schemaUpdateAccount), validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.setRole(req.params.email, req.body.role);
    res.send(account);
}));

/**
 * @swagger
 * /accounts/password/{email}:
 *   patch:
 *     summary: Update account password
 *     description: Updates account password. Users can only update their own password, admins can update any account.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the account to update
 *         example: john.doe@example.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain at least 1 special character, 1 lowercase, 1 uppercase, 1 number, no whitespace, only Latin characters
 *                 example: "NewPass123!"
 *           example:
 *             password: "NewPass123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "Password updated successfully"
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
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
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account not found"
 */
accountsRouter.patch('/password/:email', validateBody(schemas.schemaUpdateAccountPassword), validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    await service.updatePassword(req.params.email, req.body.password);
    res.status(200).send({ message: 'Password updated successfully' });
}));

/**
 * @swagger
 * /accounts/block/{email}:
 *   patch:
 *     summary: Block an account
 *     description: Blocks a user account. Requires admin privileges.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the account to block
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Account blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "Account blocked successfully"
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
 *       409:
 *         description: Account already blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account already blocked"
 */
accountsRouter.patch('/block/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.params.email);
    if (account.blocked) {
        throw createError(409, "Account already blocked");
    }
    await service.blockUnblockAccount(req.params.email);
    res.status(200).send({ message: 'Account blocked successfully' });
}));

/**
 * @swagger
 * /accounts/unblock/{email}:
 *   patch:
 *     summary: Unblock an account
 *     description: Unblocks a user account. Requires admin privileges.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the account to unblock
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Account unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "Account unblocked successfully"
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Unauthorized access"
 *       409:
 *         description: Account already unblocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account already unblocked"
 */
accountsRouter.patch('/unblock/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.params.email);
    if (!account.blocked) {
        throw createError(409, "Account already unblocked");
    }
    await service.blockUnblockAccount(req.params.email);
    res.status(200).send({ message: 'Account unblocked successfully' });
}));

/**
 * @swagger
 * /accounts/{email}:
 *   delete:
 *     summary: Delete an account
 *     description: Deletes an account. Users can only delete their own account, admins can delete any account.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the account to delete
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: "Account deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid token or insufficient privileges
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
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account not found"
 */
accountsRouter.delete('/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    await service.deleteAccount(req.params.email);
    res.status(200).send({ message: 'Account deleted successfully' });
}));

/**
 * @swagger
 * /accounts/login:
 *   post:
 *     summary: Login to account
 *     description: Authenticates user credentials and returns a JWT token
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain at least 1 special character, 1 lowercase, 1 uppercase, 1 number, no whitespace, only Latin characters
 *                 example: "Password123!"
 *           example:
 *             email: john.doe@example.com
 *             password: "Password123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       403:
 *         description: Account is blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Account is blocked"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Invalid credentials"
 */
accountsRouter.post('/login', validateBody(schemas.schemaLogin), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.body.email);
    if (account.blocked) {
        throw createError(403, "Account is blocked");
    }
    const token = await service.login(req.body.email, req.body.password);
    res.send({ token });
}));

export default accountsRouter;
import express from 'express';
import service from '../service/AccountService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import AccountPaths from '../security/AccountPaths.js';
import { auth } from '../security/authenticate.js';
import { createError } from '../utils/error.js';
import asyncHandler from "express-async-handler"

const accountsRouter = express.Router();

accountsRouter.post('/user', validateBody(schemas.schemaPostAccount), asyncHandler(async (req, res) => {
    const newAccount = await service.addUserAccount(req.body);
    res.status(201).send(newAccount);
}));

accountsRouter.post('/admin', validateBody(schemas.schemaPostAccount), auth(AccountPaths), asyncHandler(async (req, res) => {
    const newAccount = await service.addAdminAccount(req.body);
    res.status(201).send(newAccount);
}));

accountsRouter.get('/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.params.email);
    res.send(account);
}));

accountsRouter.patch('/roles/:email', validateBody(schemas.schemaUpdateAccount), validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.setRole(req.params.email, req.body.role);
    res.send(account);
}));

accountsRouter.patch('/password/:email', validateBody(schemas.schemaUpdateAccountPassword), validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    await service.updatePassword(req.params.email, req.body.password);
    res.status(200).send({ message: 'Password updated successfully' });
}));

accountsRouter.patch('/block/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.params.email);
    if (account.blocked) {
        throw createError(409, "Account already blocked");
    }
    await service.blockUnblockAccount(req.params.email);
    res.status(200).send({ message: 'Account blocked successfully' });
}));

accountsRouter.patch('/unblock/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    const account = await service.getAccountByEmail(req.params.email);
    if (!account.blocked) {
        throw createError(409, "Account already unblocked");
    }
    await service.blockUnblockAccount(req.params.email);
    res.status(200).send({ message: 'Account unblocked successfully' });
}));

accountsRouter.delete('/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), asyncHandler(async (req, res) => {
    await service.deleteAccount(req.params.email);
    res.status(200).send({ message: 'Account deleted successfully' });
}));

accountsRouter.post('/login', validateBody(schemas.schemaLogin), asyncHandler(async (req, res) => {
    const token = await service.login(req.body.email, req.body.password);
    res.send({ token });
}));

export default accountsRouter;
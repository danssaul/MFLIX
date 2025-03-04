import express from 'express';
import service from '../service/AccountService.js';
import { validateBody, validateParam } from '../utils/validator.js';
import { schemas } from '../validation/schemas.js';
import AccountPaths from '../security/AccountPaths.js';
import { auth } from '../security/authenticate.js';
import { createError } from '../utils/error.js';

const accountsRouter = express.Router();

accountsRouter.post('/user', validateBody(schemas.schemaPostAccount), async (req, res) => {
    try {
        const newAccount = await service.addUserAccount(req.body);
        res.status(201).send(newAccount);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.post('/admin', validateBody(schemas.schemaPostAccount), auth(AccountPaths), async (req, res) => {
    try {
        const newAccount = await service.addAdminAccount(req.body);
        res.status(201).send(newAccount);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.get('/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), async (req, res) => {
    try {
        const account = await service.getAccountByEmail(req.params.email);
        res.send(account);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.patch('/roles/:email', validateBody(schemas.schemaUpdateAccount), validateParam(schemas.schemaEmail), auth(AccountPaths), async (req, res) => {
    try {
        const account = await service.setRole(req.params.email, req.body.role);
        res.send(account);
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.patch('/password/:email', validateBody(schemas.schemaUpdateAccountPassword), validateParam(schemas.schemaEmail), auth(AccountPaths), async (req, res) => {
    try {
        await service.updatePassword(req.params.email, req.body.password);
        res.status(200).send({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.patch('/block/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), async (req, res) => {
    try {
        const account = await service.getAccountByEmail(req.params.email);
        if (account.blocked) {
            throw createError(409, "Account already blocked");
        }
        await service.blockUnblockAccount(req.params.email);
        res.status(200).send({ message: 'Account blocked successfully' });
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.patch('/unblock/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), async (req, res) => {
    try {
        const account = await service.getAccountByEmail(req.params.email);
        if (!account.blocked) {
            throw createError(409, "Account already unblocked");
        }
        await service.blockUnblockAccount(req.params.email);
        res.status(200).send({ message: 'Account unblocked successfully' });
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.delete('/:email', validateParam(schemas.schemaEmail), auth(AccountPaths), async (req, res) => {
    try {
        await service.deleteAccount(req.params.email);
        res.status(200).send({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

accountsRouter.post('/login', validateBody(schemas.schemaLogin), async (req, res) => {
    try {
        const token = await service.login(req.body.email, req.body.password);
        res.send({ token });
    } catch (error) {
        res.status(error.status || 500).send({ error: error.message });
    }
});

export default accountsRouter;
import express from 'express';
import service from '../service/AccountService.js';

const accountsRouter = express.Router();

accountsRouter.post('/user', async (req, res) => {
    try {
        const newAccount = await service.addUserAccount(req.body);
        res.status(201).send(newAccount);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

accountsRouter.post('/admin', async (req, res) => {
    try {
        const newAccount = await service.addAdminAccount(req.body);
        res.status(201).send(newAccount);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

accountsRouter.get('/:email', async (req, res) => {
    try {
        const account = await service.getAccountByEmail(req.params.email);
        if (!account) {
            res.status(404).send({ error: 'Account not found' });
            return;
        }
        res.send(account);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

accountsRouter.patch('/roles/:email', async (req, res) => {
    try {
        const account = await service.setRole(req.params.email, req.body.role);
        res.send(account);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

accountsRouter.patch('/password/:email', async (req, res) => {
    try {
        await service.updatePassword(req.params.email, req.body.password);
        res.status(200).send({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

accountsRouter.delete('/:email', async (req, res) => {
    try {
        await service.deleteAccount(req.params.email);
        res.status(200).send({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

accountsRouter.post('/login', async (req, res) => {
    try {
        const token = await service.login(req.body.email, req.body.password);
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

export default accountsRouter;
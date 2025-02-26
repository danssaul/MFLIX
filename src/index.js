import dotenv from "dotenv";
import express from 'express';
import accountsRouter from './controller/accounts.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/accounts', accountsRouter);

const port = process.env.PORT || 3500;
app.listen(port, () => console.log(`server is listening on port ${port}`));
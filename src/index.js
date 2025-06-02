import MongoConnection from "./db/MongoConnection.js";
import dotenv from "dotenv";
import express from 'express';
import accountsRouter from './controller/accounts.js';
import moviesRouter from './controller/movies.js';
import commentsRouter from "./controller/comments.js";
import favoritesRouter from "./controller/favorites.js";
import { logger } from "./utils/logger.js";
import appLogger from "./utils/appLogger.js";
import { errorHandler } from "./utils/error.js";
import { authenticate } from "./security/authenticate.js";
import { swaggerUi, swaggerSpec } from '../src/utils/swagger.js';
import cors from 'cors';

dotenv.config();
const { CONNECTION_STRING, DB_NAME } = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);

connection.connectToDatabase().then(() => {
    appLogger.info("Connected to the database successfully");
});

const app = express();
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(logger);
app.use(authenticate());
app.use('/accounts', accountsRouter);
app.use('/movies', moviesRouter);
app.use('/comments', commentsRouter);
app.use('/favorites', favoritesRouter);
app.use(errorHandler);


const port = process.env.PORT || 3500;
app.listen(port, () => appLogger.info(`server is listening on port ${port}`));
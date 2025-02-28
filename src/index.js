import MongoConnection from "./db/MongoConnection.js";
import dotenv from "dotenv";
import movieService from "./service/MovieService.js";
import express from 'express';
import accountsRouter from './controller/accounts.js';
import moviesRouter from './controller/movies.js';
import service from "./service/AccountService.js";
import commentService from "./service/CommentsService.js";
import commentsRouter from "./controller/comments.js";
import favoriteService from "./service/FavoriteService.js";
import favoritesRouter from "./controller/favorites.js";

dotenv.config();
const {
    CONNECTION_STRING,
    DB_NAME,
} = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);

connection.connectToDatabase().then(() => {
    console.log("Connected to the database successfully");
});

const app = express();
app.use(express.json());
app.use('/accounts', accountsRouter);
app.use('/movies', moviesRouter);
app.use('/comments', commentsRouter);
app.use('/favorites', favoritesRouter)

const port = process.env.PORT || 3500;
app.listen(port, () => console.log(`server is listening on port ${port}`));
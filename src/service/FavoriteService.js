import MongoConnection from "../db/MongoConnection.js";
import { ObjectId } from "mongodb";
import { createError } from '../utils/error.js';

class FavoriteService {
    constructor(connection, collection) {
        this.connection = connection;
        this.collection = collection;
    }

    async addFavorite(favorite) {
        const existingFavorite = await userFavorites.findOne({
            movie_id: new ObjectId(favorite.movie_id),
            email: favorite.email
        });
        if (existingFavorite) throw createError(409, "movie already added to favorites");

        favorite.viewed = false;
        favorite.movie_id = new ObjectId(favorite.movie_id);
        const { insertedId } = await this.collection.insertOne(favorite);
        const newFavorite = await this.collection.findOne({ _id: insertedId });

        await userFavorites.insertOne({ email: favorite.email, movie_id: new ObjectId(favorite.movie_id) });
        return newFavorite;
    }

    async getFavoritesByEmail(email) {
        const favorites = await this.collection.find({ email: email }).toArray();
        if (favorites.length === 0) throw createError(404, "favorites not found");
        return favorites;
    }

    async updateFavorite(id, viewed, feedback) {
        const favorite = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { viewed, feedback } },
            { returnDocument: 'after' }
        )
        if (!favorite) throw createError(404, "favorite not found");
        return favorite;
    }

    async deleteFavorite(id, email) {
        const favorite = await this.collection.findOneAndDelete({ _id: new ObjectId(id) });
        if (!favorite) throw createError(404, "favorite not found");

        await this.collection.deleteOne({ _id: new ObjectId(id) });
        await userFavorites.deleteOne({ email, movie_id: favorite.movie_id });
        return favorite;
    }
}

const { CONNECTION_STRING, DB_NAME, COLLECTION_NAME_FAVORITES, COLLECTION_NAME_USER_FAVORITES } = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);
const userFavorites = await connection.getCollection(COLLECTION_NAME_USER_FAVORITES);

const favorites = await connection.getCollection(COLLECTION_NAME_FAVORITES);
const favoriteService = new FavoriteService(connection, favorites);

export default favoriteService;
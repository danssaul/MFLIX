import MongoConnection from "../db/MongoConnection.js";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import accountService from "./AccountService.js";


class CommentService {
    constructor(connection, collection) {
        this.connection = connection;
        this.collection = collection;
    }

    async getCommentsByMovieID(id) {
        return await this.collection.find({ movie_id: new ObjectId(id) }).toArray();
    }

    async addComment(comment) {
        await movies.updateOne({ _id: new ObjectId(comment.movie_id) }, { $inc: { num_mflix_comments: 1 } });
        comment.date = new Date();
        const { insertedId } = await this.collection.insertOne(comment);
        return await this.collection.findOne({ _id: insertedId });
    }

    async updateComment(id, text) {
        const comment = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { text } }
        );
        return comment;
    }

    async getCommentsByEmail(email) {
        return await this.collection.find({ email: email }).toArray();
    }

    async deleteCommentByID(id) {
        const comment = await this.collection.findOneAndDelete({ _id: new ObjectId(id) });
        if (!comment) throw new Error('comment not found');
        await movies.updateOne({ _id: new ObjectId(comment.movie_id) }, { $inc: { num_mflix_comments: -1 } });
        return comment;
    }

}

dotenv.config();
const {
    CONNECTION_STRING,
    DB_NAME,
    COLLECTION_NAME_MOVIES,
    COLLECTION_NAME_COMMENTS,
} = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);
const comments = await connection.getCollection(COLLECTION_NAME_COMMENTS);
const movies = await connection.getCollection(COLLECTION_NAME_MOVIES);
const commentService = new CommentService(connection, comments);
export default commentService;
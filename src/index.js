import MongoConnection from "./db/MongoConnection.js";
import dotenv from "dotenv";
import ValidationUser from "./validation/validationUser.js";
import bcrypt from "bcrypt";

dotenv.config();
const {
    CONNECTION_STRING,
    DB_NAME,
    COLLECTION_NAME_MOVIES,
    COLLECTION_NAME_COMMENTS,
    COLLECTION_NAME_USERS,
    COLLECTION_NAME_FAVORITES
} = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);

connection.connectToDatabase().then(() => {
    console.log("Connected to the database successfully");
});

const users = await connection.getCollection(COLLECTION_NAME_USERS);

const validation = new ValidationUser();
const user = {
    username: "John Doe",
    email: "daniel@gmail.com",
    password: "Password123!"
};

console.log(validation.getValueValidated(user));

users.insertOne(validation.getValueValidated(user)).then(() => {
    console.log("User inserted successfully");
});


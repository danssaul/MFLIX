import MongoConnection from "./db/MongoConnection.js";
import dotenv from "dotenv";
import ValidationAccount from "./validation/ValidationAccount.js";
import bcrypt from "bcrypt";
import Service from "./service/AccountService.js";

dotenv.config();
const {
    CONNECTION_STRING,
    DB_NAME,
    COLLECTION_NAME_MOVIES,
    COLLECTION_NAME_COMMENTS,
    COLLECTION_NAME_ACCOUNTS,
    COLLECTION_NAME_FAVORITES
} = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);

connection.connectToDatabase().then(() => {
    console.log("Connected to the database successfully");
});

const users = await connection.getCollection(COLLECTION_NAME_ACCOUNTS);

const validation = new ValidationAccount();
const user = {
    "username": "Daniel",
    "email": "jocsa@gmail.com",
    "password": "Password123!",
    "blocked": true,
};


const service = new Service(connection, users);

await service.addAdminAccount(user).then(() => {
    console.log("User inserted successfully");
});

await service.setRole(user.email, "settedROlelll").then(() => {
    console.log("Role setted successfully");
});

await service.updatePassword(user.email, "Password123456!").then(() => {
    console.log("Password updated successfully");
});

await service.blockUnblockAccount(user.email).then(() => {
    console.log("Account blocked/unblocked successfully");
});

await service.deleteAccount(user.email).then(() => {
    console.log("Account deleted successfully")
});

await service.login(user.email, user.password).then(() => {
    console.log("Login successfully");
});  
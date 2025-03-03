import bcrypt from 'bcrypt';
import JwtUtils from '../utils/token.js';
import { getExpirationIn } from '../utils/expiration.js';
import dotenv from 'dotenv';
import MongoConnection from "../db/MongoConnection.js";
import { createError } from '../utils/error.js';

class AccountService {
    constructor(connection, collection) {
        this.connection = connection;
        this.collection = collection;
    }

    addUserAccount = async (account) => {
        account.role = 'user';
        return this.#createAccount(account);
    };

    addAdminAccount = async (account) => {
        account.role = 'admin';
        return this.#createAccount(account);
    };

    #createAccount = async (account) => {
        if (await this.getAccountByEmail(account.email)) {
            throw createError(409, "Account already exists");
        }
        const newAccount = this.#prepareAccountForInsertion(account);
        const { insertedId } = await this.collection.insertOne(newAccount);
        return await this.collection.findOne({ _id: insertedId });
    };

    setRole = async (email, role) => {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.updateOne({ email }, { $set: { role } });
        account.role = role;
        const updatedAccount = this.#prepareAccountForInsertion(account);
        return updatedAccount;
    };

    updatePassword = async (email, newPassword) => {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        if (bcrypt.compareSync(newPassword, account.password)) {
            throw new Error('Password is the same');
        }
        await this.collection.updateOne(
            { email },
            { $set: { password: bcrypt.hashSync(newPassword, 10) } }
        );
    };

    getAccountByEmail = async (email) => {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        return account;
    };

    updateMoviesVoted = async (email, movieId) => {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.updateOne
            (
                { email },
                { $push: { moviesVoted: movieId } }
            );
    }

    #prepareAccountForInsertion = (account) => {

        const hashPassword = bcrypt.hashSync(account.password, 10);
        const expiration = Date.now() + getExpirationIn();

        const Account = {
            email: account.email,
            username: account.username,
            role: account.role,
            blocked: false,
            password: hashPassword,
            expiration,
            moviesVoted: [],
        };

        return Account;

    }


    blockUnblockAccount = async (email) => {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.updateOne(
            { email },
            { $set: { blocked: !account.blocked } }
        );
    };

    deleteAccount = async (email) => {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.deleteOne({ email });
    };

    login = async (email, password) => {

        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }

        const accountToBeChecked = this.#prepareAccountForInsertion(account);

        if (!bcrypt.compareSync(password, account.password)) {
            throw new Error('Invalid password');
        }

        if (new Date().getTime() > accountToBeChecked.expiration) {
            throw new Error('Session expired');
        }

        return JwtUtils.getJwt(accountToBeChecked);

    }

    async updateNumComments(movie_id) {
        await this.collection.updateOne(
            { "imdb.id": movie_id },
            { $inc: { "imdb.num_mflix_comments": 1 } }
        )
    }

}

dotenv.config();
const {
    CONNECTION_STRING,
    DB_NAME,
    COLLECTION_NAME_ACCOUNTS
} = process.env;

const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);
const users = await connection.getCollection(COLLECTION_NAME_ACCOUNTS);

const accountService = new AccountService(connection, users);
export default accountService;
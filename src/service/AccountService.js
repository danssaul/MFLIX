import bcrypt from 'bcrypt';
import JwtUtils from '../utils/token.js';
import { getExpirationIn } from '../utils/expiration.js';
import MongoConnection from "../db/MongoConnection.js";
import { createError } from '../utils/error.js';

class AccountService {
    constructor(connection, collection) {
        this.connection = connection;
        this.collection = collection;
    }

    async addUserAccount(account) {
        account.role = 'user';
        return this.#createAccount(account);
    }

    async addAdminAccount(account) {
        account.role = 'admin';
        return this.#createAccount(account);
    }

    async #createAccount(account) {
        const accountChecked = await this.collection.findOne({ email: account.email });
        if (accountChecked) {
            throw createError(409, "Account already exists");
        }
        const newAccount = await this.#prepareAccountForInsertion(account);
        const { insertedId } = await this.collection.insertOne(newAccount);
        return await this.collection.findOne({ _id: insertedId });
    }

    async setRole(email, role) {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.updateOne({ email }, { $set: { role } });
        account.role = role;
        const updatedAccount = this.#prepareAccountForInsertion(account);
        return updatedAccount;
    }

    async updatePassword(email, newPassword) {
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
    }

    async getAccountByEmail(email) {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        return account;
    }

    async updateMoviesVoted(email, movieId) {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        if (!account.moviesVoted.includes(Number(movieId))) {
            await this.collection.updateOne(
                { email },
                { $push: { moviesVoted: movieId } }
            );
        }
    }

    async #prepareAccountForInsertion(account) {
        const hashPassword = bcrypt.hashSync(account.password, 10);
        const expiration = Date.now() + getExpirationIn();

        const Account = {
            email: account.email,
            username: account.username,
            role: account.role,
            blocked: false,
            password: hashPassword,
            expiration: expiration,
            moviesVoted: [],
            numRequest: 0,
            lastResetTime: Date.now()
        };

        return Account;
    }

    async blockUnblockAccount(email) {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.updateOne(
            { email },
            { $set: { blocked: !account.blocked } }
        );
    }

    async deleteAccount(email) {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }
        await this.collection.deleteOne({ email });
    }

    async login(email, password) {
        const account = await this.collection.findOne({ email });
        if (!account) {
            throw createError(404, 'Account not found');
        }

        account.expiration = Date.now() + getExpirationIn();

        if (!bcrypt.compareSync(password, account.password)) {
            throw createError(401, 'passwords do not match');
        }

        if (new Date().getTime() > account.expiration) {
            throw createError(403, 'Account session has expired. Please log in again.');
        }

        return JwtUtils.getJwt(account);
    }

    async updateNumComments(movie_id) {
        await this.collection.updateOne(
            { "imdb.id": movie_id },
            { $inc: { "imdb.num_mflix_comments": 1 } }
        )
    }

    async incrementRequestCount(email) {
        await this.collection.updateOne(
            { email },
            {
                $inc: { "numRequest": 1 }
            }
        )
    }

    async resetRequestCount(email, currentTime) {
        await this.collection.updateOne(
            { email },
            {
                $set: {
                    numRequest: 0,
                    lastResetTime: currentTime
                }
            }
        );
    }

}

const { CONNECTION_STRING, DB_NAME, COLLECTION_NAME_ACCOUNTS } = process.env;
const connection = new MongoConnection(CONNECTION_STRING, DB_NAME);
const users = await connection.getCollection(COLLECTION_NAME_ACCOUNTS);
const accountService = new AccountService(connection, users);
export default accountService;
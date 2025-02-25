import bcrypt from 'bcrypt';
import JwtUtils from '../utils/token.js';
import { getExpirationIn } from '../utils/expiration.js';

export default class AccountService {
    constructor(connection, collection) {
        this.connection = connection;
        this.collection = collection;
    }

    getCollection = async (collectionName) => {
        return this.connection.getCollection(collectionName);
    };

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
            throw new Error('Account already exists');
        }
        const newAccount = this.#prepareAccountForInsertion(account);
        await this.collection.insertOne(newAccount);
        return newAccount;
    };

    setRole = async (email, role) => {
        const account = await this.getAccountByEmail(email);
        if (!account) {
            throw new Error('Account not found');
        }
        await this.collection.updateOne({ email }, { $set: { role } });
    };

    updatePassword = async (email, newPassword) => {
        const account = await this.getAccountByEmail(email);
        if (!account) {
            throw new Error('Account not found');
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
        return await this.collection.findOne({ email });
    };

    getAccountByEmail = async (email) => {

        return await this.collection.findOne({
            email: email
        });

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
            expiration
        };

        return Account;

    }


    blockUnblockAccount = async (email) => {
        const account = await this.getAccountByEmail(email);
        if (!account) {
            throw new Error('Account not found');
        }
        await this.collection.updateOne(
            { email },
            { $set: { blocked: !account.blocked } }
        );
    };

    deleteAccount = async (email) => {
        const account = await this.getAccountByEmail(email);
        if (!account) {
            throw new Error('Account not found');
        }
        await this.collection.deleteOne({ email });
    };

    login = async (email, password) => {

        const account = await this.getAccountByEmail(email);
        if (!account) {
            throw new Error('Account not found');
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

}
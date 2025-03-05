import accountService from "../service/AccountService.js";
import { createError } from "../utils/error.js";

export const attachAccount = async (req, res, next) => {
    try {
        const account = await accountService.getAccountByEmail(req.user);
        if (!account) {
            return next(createError(404, "Account not found"));
        }
        req.account = account;
        next();
    } catch (err) {
        next(err);
    }
};
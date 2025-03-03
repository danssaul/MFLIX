import accountService from '../service/AccountService.js';
import JwtUtils from '../utils/token.js';
import dotenv from 'dotenv';
import { createError } from '../utils/error.js';

dotenv.config();
const BEARER = "Bearer ";
const BASIC = "Basic ";
export function authenticate() {
    return async (req, res, next) => {
        const authHeader = req.header("Authorization");
        if (authHeader) {
            if (authHeader.startsWith(BEARER)) {
                jwtAuthentication(req, authHeader);
            } else if (authHeader.startsWith(BASIC)) {
                await basicAuthentication(req, authHeader);
            }
        }

        next();
    };
}

function jwtAuthentication(req, authHeader) {
    const token = authHeader.substring(BEARER.length);
    try {
        const payload = JwtUtils.verifyJwt(token);
        req.user = payload.sub;
        req.role = payload.role;
        req.authType = "jwt";
    } catch (error) { }
}

async function basicAuthentication(req, authHeader) {
    const userNamePassword64 = authHeader.substring(BASIC.length); //username:password
    const userNamePassword = Buffer.from(userNamePassword64, "base64").toString(
        "utf-8"
    );
    const userNamePasswordArr = userNamePassword.split(":");

    try {
        if (userNamePasswordArr[0] === process.env.ADMIN_EMAIL) {
            if (userNamePasswordArr[1] === process.env.ADMIN_PASSWORD) {
                req.user = process.env.ADMIN_EMAIL;
                req.role = "";
                req.authType = "basic";
            }
        } else {
            const account = await accountService.getAccountByEmail(userNamePasswordArr[1]); 
            await accountService.login(account, userNamePasswordArr[1]);
            req.user = userNamePasswordArr[0];
            req.role = account.role;
            req.authType = "basic";
        }
    } catch (error) { }
}

export function auth(paths) {
    return (req, res, next) => {
        const { authentication, authorization } = paths[req.method];
        if (!authorization) {
            throw createError(500, "security configuration not provided");
        }
        if (authentication(req)) {
            if (req.authType !== authentication(req)) {
                throw createError(401, "no required authentication");
            }
            if (!authorization(req)) {
                throw createError(403, "");
            }
        }
        next();
    };
}
import accountService from '../service/AccountService.js';
import JwtUtils from '../utils/token.js';
import { createError } from '../utils/error.js';

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
    } catch (error) {
        throw createError(401, "Invalid token");
    }
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
            const account = await accountService.getAccountByEmail(userNamePasswordArr[0]); 
            await accountService.login(userNamePasswordArr[0], userNamePasswordArr[1]);
            req.user = userNamePasswordArr[0];
            req.role = account.role;
            req.authType = "basic";
        }
    } catch (error) {
        throw createError(401, "Invalid credentials");
    }
}

export function auth(paths) {
    return async (req, res, next) => {
        const { authentication, authorization } = paths[req.method];
        if (!authorization) {
            return res.status(500).send({ error: "security configuration not provided" });
        }
        if (authentication(req)) {
            if (req.authType !== authentication(req)) {
                return res.status(401).send({ error: "no required authentication" });
            }
            try {
                const isAuthorized = await authorization(req);
                if (!isAuthorized) {
                    return res.status(403).send({ error: "not authorized" });
                }
            } catch (error) {
                return res.status(error.status || 500).send({ error: error.message });
            }
        }
        next();
    };
}
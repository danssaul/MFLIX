import jwt from 'jsonwebtoken';
import { getExpirationIn } from '../utils/expiration.js';
export default class JwtUtils {
    static getJwt(account) {
       return jwt.sign({role: account.role}, process.env.JWT_SECRET, {
        subject:account.username,
        expiresIn: getExpirationIn() + ""
       })
    }
    static verifyJwt(token) {
       return jwt.verify(token, process.env.JWT_SECRET);
    }
}
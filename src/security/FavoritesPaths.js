import dotenv from "dotenv";
import favoriteService from "../service/FavoriteService.js";
import { createError } from "../utils/error.js";
dotenv.config();

const FavoritesPaths = {
    GET: {
        authentication: () => 'jwt',
        authorization: async (req) => {
            return req.role === 'premium_user' && req.user === req.params.email;
        }
    },

    POST: {
        authentication: () => 'jwt',
        authorization: async (req) => {
            return req.role === 'premium_user';
        }
    },

    PUT: {
        authentication: () => 'jwt',
        authorization: async (req) => {
            try {
                const favorites = await favoriteService.getFavoritesByEmail(req.user);
                if (favorites.length === 0) {
                    return false;
                }
                return req.role === 'premium_user' && req.user === favorites[0].email;
            } catch (error) {
                return false;
            }
        }
    },

    DELETE: {
        authentication: () => 'jwt',
        authorization: async (req) => {
            try {
                return req.role === 'premium_user' && req.user === req.body.email;
            } catch (error) {
                return false;
            }
        }
    }

};

export default FavoritesPaths;

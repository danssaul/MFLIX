import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);

const properties = {
    username: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/)
        .min(3)
        .max(30)
        .required(),
    password: joiPassword
        .string()
        .min(8)
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .doesNotInclude(["password", "12345"])
        .required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid("admin", "user", "premium_user")
        .required(),

    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    text: Joi.string().required(),
    movie_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    year: Joi.number().integer(),             
    actor: Joi.string(),                       
    genres: Joi.array().items(Joi.string()),    
    language: Joi.string(),                    
    amount: Joi.number().integer().min(1).required(),
    rating: Joi.number().min(1).max(10).required(),
    imdb: Joi.number().integer().required()
}

export const schemas = {
    schemaPostAccount: Joi.object({
        username: properties.username,
        email: properties.email,
        password: properties.password
    }),

    schemaUpdateAccount: Joi.object({
        role: properties.role
    }),

    schemaUpdateAccountPassword: Joi.object({
        password: properties.password
    }),

    schemaLogin: Joi.object({
        email: properties.email,
        password: properties.password
    }),

    schemaEmail: Joi.object({
        email: properties.email
    }),

    schemaId: Joi.object({
        id: properties.id
    }),

    schemaPostComment: Joi.object({
        username: properties.username,
        email: properties.email,
        movie_id: properties.movie_id,
        text: properties.text
    }),

    schemaText: Joi.object({
        text: properties.text
    }),

    schemaUpdateComment: Joi.object({
        id: properties.id,
        text: properties.text
    }),

    schemaPostFavorite: Joi.object({
        email: properties.email,
        movie_id: properties.movie_id,
        feedback: properties.text
    }),

    schemaUpdateFavorite: Joi.object({
        id: properties.id,
        feedback: properties.text,
        viewed: Joi.boolean()
    }),

    schemaDeleteFavorite: Joi.object({
        id: properties.id,
        email: properties.email
    }),

    schemaMostRatedAndCommented : Joi.object({
        year: properties.year,
        amount: properties.amount,
        actor: properties.actor,
        language: properties.language,
        genres: properties.genres
    }),

    schemaUpdateMovieRating: Joi.object({
        rating: properties.rating,
        email: properties.email
    }),

    schemaImdbId: Joi.object({
        imdb: properties.imdb
    })
};
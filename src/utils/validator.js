import { createError } from "./error.js";

export function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            throw createError(400, error.details.map((d) => d.message).join(";"));
        }
        next();
    };
}

export function validateParam(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, { abortEarly: false });
        if (error) {
            throw createError(400, error.details.map((d) => d.message).join(";"));
        }
        next();
    };
};
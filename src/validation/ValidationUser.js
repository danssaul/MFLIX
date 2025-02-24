import Joi from 'joi';
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);

export default class ValidationUser {
    constructor() {
        this.schemaUsers = Joi.object({

            username: Joi.string()
                .pattern(/^[a-zA-Z\s]+$/)
                .min(3)
                .max(30)
                .required(),

            email: Joi.string().email().required(),

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
                .required()

        });
    }

    getValueValidated(user) {
        const { error, value } = this.schemaUsers.validate(user);
        if (error) {
            return error.message;
        } else {
            return value;
        }
    }
}
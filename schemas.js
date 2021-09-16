const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)



module.exports.placeSchema = Joi.object({
    place: Joi.object({
        name: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        images: Joi.string().optional().allow(''),
        price: Joi.number().required().min(0)
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        text: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})


module.exports.userSchema = Joi.object({
    user: Joi.object({
        description: Joi.string().required().escapeHTML(),
    }).required()
})

module.exports.messageSchema = Joi.object({
    message: Joi.string().required().escapeHTML()
})
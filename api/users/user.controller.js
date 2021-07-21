const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");

const userModel = require("./user.model");
const { UnauthorizedError, ValidateError } = require("../helpers/error.constructor");

const costFactor = 4;

async function signUp(req, res, next) {
    try {
        const { email, password } = req.body;
        const passwordHash = await bcryptjs.hash(password, costFactor);
        const userInDatabase = await userModel.findOne({email});
        if (userInDatabase) {
            return res.status(409).json({"message": "Email in use"});
        }
        const avatarURL = gravatar.url(email);
        const newUser = await userModel.create({email, password: passwordHash, avatarURL});
        return res.status(201).json({
            "user": {
                email: newUser.email,
                subscription: newUser.subscription,
                avatarURL: newUser.avatarURL
            }});
    } catch (err) {
        next(err);
    }
}

async function logIn(req, res, next) {
    try {
        const {email, password} = req.body;
        const userInDatabase = await userModel.findOne({email});
        if (!userInDatabase) {
            throw new UnauthorizedError("Email or password is wrong");
        }
        const isPasswordValid = await bcryptjs.compare(password, userInDatabase.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Email or password is wrong");
        }
        const token = await jwt.sign({id: userInDatabase._id}, process.env.JWT_SECRET, {expiresIn: 2*24*60*60});
        await userModel.findByIdAndUpdate(userInDatabase._id, {token}, {new: true});
        return res.status(200).json({
            "token": token,
            "user": {
              "email": email,
              "subscription": userInDatabase.subscription
            }
          });
    } catch (err) {
        next(err);
    }
};

async function logOut(req, res, next) {
    try {
        const user = req.user;
        await userModel.findByIdAndUpdate(user._id, {token: null});
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function getCurrentUser(req, res, next) {
    try {
        const {_id} = req.user;
        const currentUser = await userModel.findById(_id);
        return res.status(200).json(prepareUsersResponse([currentUser]));
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const userId = req.user._id;
        const userToUpdate = await userModel.findByIdAndUpdate(userId, {$set: req.body}, {new: true});
        return res.status(200).send(prepareUsersResponse([userToUpdate]));
    } catch (err) {
        next(err);
    }
}

async function authorize(req, res, next) {
    try {
        const authorizationHeader = req.get("Authorization") || "";
        const token = authorizationHeader.replace("Bearer ", "");
        let userId;
        try {
            userId = await jwt.verify(token, process.env.JWT_SECRET).id;
        } catch (err) {
            throw new UnauthorizedError("Not authorized");
        }
        const user = await userModel.findById(userId);
        if(!user || user.token !== token) {
            throw new UnauthorizedError("Not authorized");
        }
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        next(err);
    }
}

function validateAuth(req, res, next) {
    const signUpRules = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    const validationResult = signUpRules.validate(req.body);
    if (validationResult.error) {
        throw new ValidateError("Ошибка от Joi или другой библиотеки валидации");
    }
    next();
};

function validateUpdateSubs(req, res, next) {
    const subscriptionRules = Joi.object({
        subscription: Joi.string().valid("starter", "pro", "business").required(),
    });
    const subscriptionResult = subscriptionRules.validate(req.body);
    if(subscriptionResult.error) {
        throw new ValidateError("Ошибка от Joi или другой библиотеки валидации");
    }
    next();
}

function prepareUsersResponse(users) {
    return users.map((user) => {
        const {_id, subscription, email, avatarURL} = user;
        return {id: _id, subscription, email, avatarURL};
    })
}

module.exports = {
    signUp,
    validateAuth,
    logIn,
    authorize,
    logOut,
    getCurrentUser,
    updateUser,
    validateUpdateSubs
};
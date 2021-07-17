const { Router } = require("express");

const userController = require("./user.controller");

const userRouter = Router();

userRouter.post("/signup", userController.validateAuth, userController.signUp);

userRouter.post("/login", userController.validateAuth, userController.logIn);

userRouter.post("/logout", userController.authorize, userController.logOut);

userRouter.get("/current", userController.authorize, userController.getCurrentUser);

userRouter.patch("/", userController.authorize, userController.validateUpdateSubs, userController.updateUser);

module.exports = userRouter;
const express = require("express");

const ContactController = require("./contact.controller");

const contactRouter = express.Router();

contactRouter.get("/", ContactController.listContacts);

contactRouter.get("/:id", ContactController.getById);

contactRouter.post("/", ContactController.validateCreateContact, ContactController.addContact);

contactRouter.put("/:id", ContactController.validateUpdateContact, ContactController.updateContact);

contactRouter.delete("/:id", ContactController.removeContact);

module.exports = contactRouter;
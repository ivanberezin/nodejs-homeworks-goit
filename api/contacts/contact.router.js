const express = require("express");

const contactController = require("./contact.controller");

const contactRouter = express.Router();

contactRouter.get("/", contactController.getContactsList);

contactRouter.get("/:id", contactController.validateId, contactController.getContactById);

contactRouter.post("/", contactController.validateCreateContact, contactController.addContact);

contactRouter.put("/:id", contactController.validateId, contactController.validateUpdateContact, contactController.updateContact);

contactRouter.patch("/:id/favorite", contactController.validateId, contactController.validateUpdateStatusContact, contactController.updateStatusContact)

contactRouter.delete("/:id", contactController.validateId, contactController.removeContact);

module.exports = contactRouter;
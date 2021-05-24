// const contacts = require('../../db/contacts.json');
const Joi = require('joi');
const { Types: { ObjectId } } = require("mongoose");

const contactModel = require('./contact.model');

class ContactController {

  get getContactsList() {
    return this._getContactsList.bind(this);
  }

  get getContactById() {
    return this._getContactById.bind(this);
  }
  get addContact() {
    return this._addContact.bind(this);
  }
  get updateContact() {
    return this._updateContact.bind(this);
  }
  get updateStatusContact() {
    return this._updateStatusContact.bind(this);
  }
  get removeContact() {
    return this._removeContact.bind(this);
  }
    
  async _getContactsList(req, res, next) {
    try {
      const contacts = await contactModel.find();
      return contacts
        ? res.status(200).json(contacts)
        : this.NotFoundError(res);
    } catch (err) {
      next(err)
    }
  }

  async _getContactById(req, res, next) {
    try {
      const contactId = req.params.id;
      const contact = await contactModel.findById(contactId);
      return contact 
        ? res.status(200).json(contact)
        : this.NotFoundError(res);
    } catch (err) {
      next(err)
    }
  }
    
  async _addContact(req, res, next) {
    try {
      const newContact = await contactModel.create(req.body);
      return res.status(201).json(newContact);
    } catch (err) {
      next(err)
    }
  }

  async _updateContact(req, res, next) {
    try {
      const contactId = req.params.id;
      console.log('contactId: ', contactId);
      const contactUpd = await contactModel.findContactByIdAndUpdate(contactId, req.body);
      console.log('contactUpd: ', contactUpd);
      return contactUpd 
        ? res.status(200).json(contactUpd)
        : this.NotFoundError(res);
    } catch (err) {
      next(err);
    }
  }

  async _updateStatusContact(req, res, next) {
    try {
      const contactId = req.params.id;
      const contactUpdStatus = await contactModel.findContactByIdAndUpdate(contactId, req.body);
      return contactUpdStatus 
        ? res.status(200).json(contactUpdStatus)
        : this.NotFoundError(res);
    } catch (err) {
      next(err);
    }
  }

  async _removeContact(req, res, next) {
    try {
      const contactId = req.params.id;
      const deletedContact = await contactModel.findByIdAndDelete(contactId);
      return deletedContact 
        ? res.status(200).json(deletedContact)
        : this.NotFoundError(res);
    } catch (err) {
      next(err);
    }
  }

  findContactIndexById(res, contactId) {
    const id = parseInt(contactId);
    const targetContactIndex = contacts.findIndex(contact => contact.id === id);
    if (targetContactIndex === -1) {
      return this.NotFoundError(res);
    }
    return targetContactIndex;
  }

  validateId (req, res, next) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send();
    }
    next();
  }
    
  validateCreateContact(req, res, next) {
    const createContactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      favorite: Joi.boolean()
    });
    const result = createContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).json({"message": "missing required name field"});
    }    
    next();
  }
    
  validateUpdateContact(req, res, next) {
    const updateContactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      favorite: Joi.boolean()
    });    
    const result = updateContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).json({"message": "missing field"});
    }    
    next();
  }

  validateUpdateStatusContact(req, res, next) {
    const updateStatusRules = Joi.object({
      favorite: Joi.boolean().required()
    });    
    const result = updateStatusRules.validate(req.body);
    if (result.error) {
      return res.status(400).json({"message": "missing field favorite"});
    }    
    next();
  }

  NotFoundError(res) {
    res.status(404).json({"message": "Not found"});
  }

}

module.exports = new ContactController();







// throw new NotFoundError("Contact not found");

// class NotFoundError extends Error {
//     constructor(message) {
//       super(message);    
//       this.status = 404;
//       delete this.stack;
//     }
// }
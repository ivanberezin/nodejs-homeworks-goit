const Joi = require('joi');
const { Types: { ObjectId } } = require("mongoose");

const contactModel = require("./contact.model");
const userModel = require("../users/user.model");
const {NotFoundError, ValidateError} = require("../helpers/error.constructor");

class ContactController {

  get getContactsList() {
    return this._getContactsList.bind(this);
  }

  get getCurrentContactsList() {
    return this._getCurrentContactsList.bind(this);
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
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const favoriteValue = req.query.favorite;
      if(favoriteValue){
        favoriteValue === 'true' 
          ? res.status(200).json(await contactModel.find().sort({favorite: -1}))
          : favoriteValue === 'false' 
            ? res.status(200).json(await contactModel.find().sort({favorite: 1}))
            : res.status(400).send({message: "Incorrect favorite value"})
      };
      if(page || limit) {
        const currentUserContactsPag = await contactModel.find().skip((page-1)*limit).limit(limit);
        return currentUserContactsPag
          ? res.status(200).json(currentUserContactsPag)
          : new NotFoundError("Not found");
      };
      const myCustomLabels = { docs: 'contacts' }
      const contacts = await contactModel.paginate({}, {page, limit, customLabels: myCustomLabels});
      return contacts
        ? res.status(200).json(contacts)
        : new NotFoundError("Not found");
    } catch (err) {
      next(err)
    }
  }

  async _getCurrentContactsList(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const favoriteValue = req.query.favorite;
      const {id} = req.params;
      const currentUser = await userModel.findById(id);
      if(currentUser && !req.query) {
        const currentUserContacts = await contactModel.find({owner: currentUserId});
        return currentUserContacts
          ? res.status(200).json(currentUserContacts)
          : new NotFoundError("Not found");
      };
      if(currentUser && favoriteValue) {
        favoriteValue === 'true' 
        ? res.status(200).json(await contactModel.find({owner: id}).sort({favorite: -1}))
        : favoriteValue === 'false' 
          ? res.status(200).json(await contactModel.find({owner: id}).sort({favorite: 1}))
          : res.status(400).send({message: "Incorrect favorite value"})
      };
      if(currentUser && page || limit) {
        const currentUserContactsPag = await contactModel.find({owner: id}).skip((page-1)*limit).limit(limit);
        return currentUserContactsPag
          ? res.status(200).json(currentUserContactsPag)
          : new NotFoundError("Not found");
      };
    } catch (err) {
      next(err)
    }
  }

  async _getContactById(req, res, next) {
    try {
      const {id} = req.params;
      const contact = await contactModel.findById(id);
      return contact 
        ? res.status(200).json(contact)
        : new NotFoundError("Not found");
    } catch (err) {
      next(err)
    }
  }
    
  async _addContact(req, res, next) {
    try {
      const userId = req.params.id;
      if(userId) {
        const newContact = await contactModel.create({...req.body, owner: userId});
        return res.status(201).json(newContact);
      }
      const newContact = await contactModel.create(req.body);
      return res.status(201).json(newContact);
    } catch (err) {
      next(err)
    }
  }

  async _updateContact(req, res, next) {
    try {
      const contactId = req.params.id;
      const contactUpd = await contactModel.findContactByIdAndUpdate(contactId, req.body);
      return contactUpd 
        ? res.status(200).json(contactUpd)
        : new NotFoundError("Not found");
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
        : new NotFoundError("Not found");
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
        : new NotFoundError("Not found");
    } catch (err) {
      next(err);
    }
  }

  findContactIndexById(res, contactId) {
    const id = parseInt(contactId);
    const targetContactIndex = contacts.findIndex(contact => contact.id === id);
    if (targetContactIndex === -1) {
      throw new NotFoundError("Not found");
    }
    return targetContactIndex;
  }

  validateId (req, res, next) {
    const { id } = req.params;
      if (!ObjectId.isValid(id)) {
      throw new ValidateError("id is not valid");
    }
    next();
  }
    
  validateCreateContact(req, res, next) {
    const createContactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      favorite: Joi.boolean(),
      owner: Joi.object()
    });
    const result = createContactRules.validate(req.body);
    if (result.error) {
      throw new ValidateError("missing required name field");
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
      throw new ValidateError("missing field");
    }    
    next();
  }

  validateUpdateStatusContact(req, res, next) {
    const updateStatusRules = Joi.object({
      favorite: Joi.boolean().required()
    });    
    const result = updateStatusRules.validate(req.body);
    if (result.error) {
      throw new ValidateError("missing field favorite");
    }    
    next();
  }

}

module.exports = new ContactController();
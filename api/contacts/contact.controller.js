const Joi = require('joi');

const contacts = require('../../db/contacts.json');

class ContactController {

  get getById() {
    return this._getById.bind(this);
  }
  get addContact() {
    return this._addContact.bind(this);
  }
  get updateContact() {
    return this._updateContact.bind(this);
  }
  get removeContact() {
    return this._removeContact.bind(this);
  }
    
  listContacts(req, res, next) {
    return res.status(200).json(contacts);
  }

  _getById(req, res, next) {
    const contactIndex = this.findContactIndexById(res, req.params.id);
    contactIndex || contactIndex == 0
    ? res.status(200).json(contacts[contactIndex])
    : this.NotFoundError(res);
  }
    
  _addContact(req, res, next) {
    const newContact = {
      id: contacts.length + 1,
      ...req.body,
    };
    contacts.push(newContact);    
    return res.status(201).send(newContact);
  }

  async _updateContact(req, res, next) {
    try {
      const targetContactIndex = this.findContactIndexById(res, req.params.id);    
      contacts[targetContactIndex] = {
        ...contacts[targetContactIndex],
        ...req.body
      };    
      return res.status(200).send(contacts[targetContactIndex]);
    } catch (err) {
      next(err);
    }
  }
    
  async _removeContact(req, res, next) {
    try {
      const targetContactIndex = this.findContactIndexById(res, req.params.id);
      targetContactIndex
      ? contacts.splice(targetContactIndex, 1)
      : this.NotFoundError(res);
      return res.status(200).send({"message": "contact deleted"});
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
    
  validateCreateContact(req, res, next) {
    const createContactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required()
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
      phone: Joi.string()
    }).min(1);  
    const result = updateContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).json({"message": "missing field"});
    }    
    next();
  }

  NotFoundError(res) {
    res.status(404).json({"message": "Not found"});
  }

}

module.exports = new ContactController();
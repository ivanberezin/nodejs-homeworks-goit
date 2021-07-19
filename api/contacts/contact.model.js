const mongoose = require('mongoose');

const { Schema } = mongoose;

const contactSchema = new Schema({
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
});

contactSchema.statics.findContactByIdAndUpdate = findContactByIdAndUpdate;

async function findContactByIdAndUpdate(contactId, updateParams) {
  return this.findByIdAndUpdate(contactId, { $set: updateParams }, { new: true })
}

const contactModel = mongoose.model("Contact", contactSchema);

module.exports = contactModel;
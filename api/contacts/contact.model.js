const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema, SchemaTypes } = mongoose;

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
  owner: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  }
});

contactSchema.statics.findContactByIdAndUpdate = findContactByIdAndUpdate;

async function findContactByIdAndUpdate(contactId, updateParams) {
  return this.findByIdAndUpdate(contactId, { $set: updateParams }, { new: true })
}

contactSchema.plugin(mongoosePaginate);

const contactModel = mongoose.model("Contact", contactSchema);

module.exports = contactModel;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ItemSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  imageId: {
    type: Object
  },
  displayOrder: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    data: Buffer,
    fileName: String,
    contentType: String,
    size: Number
  }
});

module.exports = ListItem = mongoose.model("listitems", ItemSchema);

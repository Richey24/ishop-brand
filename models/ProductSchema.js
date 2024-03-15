const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  // Add other fields as needed
});

module.exports = mongoose.model('Product', ProductSchema);

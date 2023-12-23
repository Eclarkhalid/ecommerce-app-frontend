const { Schema, models, model } = require("mongoose");

const ProductShema = new Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: String, required: true},
  images: [{type: String}]
})

export const Product = models.Product || model('Product', ProductShema);
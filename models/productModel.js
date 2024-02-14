const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'product name is required']
    },
    description: {
        type: String,
        required: [true, 'product description is required']
    },
    price: {
        type: Number,
        required: [true, 'product price is required']
    },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categoryCollection',
        required: [true, 'comes under which category is required']
    }],
    brand: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brandCollection',
        required: [true, 'comes under which brand is required']
    }],
    mainImage: {
        type: String,
        required: [true, 'primary image is required']
    },
    subImages: [{
        type: String
    }],
    stockQuantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    listed: {   // for listing and unlisting
        type: Boolean,
        default: true
    },
    deleted: {     // for soft deletion
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// creating product collection using the product schema
const productCollection = mongoose.model('productCollection', productSchema);
module.exports = productCollection;


// create dynamic rendering of category and brand in product adding page
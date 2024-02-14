const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'brand name is required']
    },
    description: {
        type: String,
        required: [true, 'brand description is required']
    },
    image: {
        type: String,
        required: [true, 'brand image is required']
    },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categoryCollection',
        required: [true, 'comes under which category is required']
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productCollection',
    }],
    sold: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    deleted: {      // for soft deletion
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

    // creating brand collection using the category schema
    const brandCollection = mongoose.model('brandCollection', brandSchema);
    module.exports = brandCollection;
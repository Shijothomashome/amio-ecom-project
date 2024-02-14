const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'category name is required']
    },
    description: {
        type: String, 
        required: [true, 'category description is required']
    },
    image: {
        type: String,
        required: [true, 'category image is required']
    },
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

// creating category collection using the created category schema
const categoryCollection = mongoose.model('categoryCollection', categorySchema);
module.exports = categoryCollection; // exporting the collection 
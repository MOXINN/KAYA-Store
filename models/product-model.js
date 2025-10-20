const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
        enum:['Khadi', 'Summer cool khadi', 'Gamcha', 'Fabric', 'Shawl', 'Kurta','Other'],
        default: 'Other',
    },
    fabricType: {
        type: String, // cotton , silk, linen, khadi, syntaatic fiber
        required: true,
        trim: true,
    },
    color: {
        type: String,
        required: true,
    },
    pattern: {
        type: String, // plain, printed, handwoven
    },
    size: {
        type: String, //optinal: S, M, L, XL or fabric length like 2.5 M
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    images: [
      {
        url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
        }
      }
    ],
    materialOrigin: {
        type: String, // "Varansi", "Kalpi", "Barabnki"
    },
   handwoven: {
    type: Boolean,
    default: true
   },
   tags: [
    {
        types: String
    }
   ],
   ratings: [
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5},
        comment: String
    }
   ],
   createdAt: {
    type: Date,
    default: Date.now
   },
   seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
   },
   isFeatured: {
    type: Boolean,
    default: false
   }
});


module.exports = mongoose.model('Product', productSchema);
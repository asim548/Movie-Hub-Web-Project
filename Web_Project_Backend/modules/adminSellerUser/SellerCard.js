const mongoose = require('mongoose');

const SellerCardSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminSeller', required: true },
    cardHolderName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true }, 
    stripeCustomerId: { type: String }, 
}, { timestamps: true });

const SellerCard = mongoose.model('SellerCard', SellerCardSchema);

module.exports = SellerCard;

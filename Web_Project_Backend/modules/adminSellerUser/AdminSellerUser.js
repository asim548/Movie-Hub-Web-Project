const mongoose = require('mongoose');

const AdminSellerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    photo: String,
    themeMode: { type: String, enum: ['dark', 'light'], default: 'dark' },
    refreshToken: String,
    role: String,
    payOnViews:{type:Number , default:0},
    totalPaid:{type:Number , default:0},
    
});


const UserPreferencesSchema = new mongoose.Schema({
    favoriteGenre: [String],
    favoriteActorsOrDirectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
});

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    photo: String,
    themeMode: { type: String, enum: ['dark', 'light'], default: 'dark' },
    refreshToken: String,
    moviesWishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    userPreferences: UserPreferencesSchema,
    userActivity: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }], 
    isSubscribed: {type:Boolean , default:false} 
})

const AdminSeller = mongoose.model('Admin', AdminSellerSchema);
const User = mongoose.model('User', UserSchema);


module.exports = {
    User,
    AdminSeller
};

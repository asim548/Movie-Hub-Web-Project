const mongoose = require('mongoose');
const { resolveMoviePosterPhoto } = require('../../utility/posterUrl');

const MovieSchema = new mongoose.Schema({
    title: String,
    genre: [String],
    filePath:String,
    videoCloudinaryPublicId: String,
    director: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' }, 
    cast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],   
    releaseDate: Date,
    runtime: Number,
    popularity:Number,
    views:{type:Number,default:0},
    overview: String,
    averageRating: Number,
    movieCoverPhoto: { type: Buffer },
    photo: String,
    ageRating: String,
    parentalGuidance: String,
    countryOfOrigin:String,
    Language: String,
    keywords:[String],
    isApproved:Boolean,
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminSeller' }
});

function posterSerializationTransform(doc, ret) {
    ret.photo = resolveMoviePosterPhoto(ret);
    delete ret.movieCoverPhoto;
    delete ret.videoCloudinaryPublicId;
    return ret;
}

MovieSchema.set('toJSON', { transform: posterSerializationTransform });
MovieSchema.set('toObject', { transform: posterSerializationTransform });

const Movie = mongoose.model('Movie', MovieSchema);
module.exports = Movie;

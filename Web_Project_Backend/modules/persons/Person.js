const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
    name: String,
    role: { type: String, enum: ['Actor', 'Director'], default: 'Actor' },
    country:String,
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    age:Number,
    biography: String,
    
    photos: [{type: Buffer}]
});


const Person = mongoose.model('Person', PersonSchema);
module.exports = Person;

const { Schema, model, ObjectId } = require('mongoose');


const User = new Schema({
    idUser: {type: Number, unique: true},
    name: { type: String, required: true, unique: true },
    maiCredits: { type: Number, default: 350 },
    lastRespect: { type: Date, default: Date.now() },
    respect: { type: Number, default: 0 }
});

module.exports = model('User', User);

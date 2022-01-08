const {Schema, model} = require('mongoose');


const User = new Schema({
    userId: {type: Number, unique: true, required: true},
    userName: {type: String, required: true},
    credits: {type: Number, default: 350},
    lastRespect: {type: Date, default: Date.now()},
    respect: {type: Number, default: 0}
});

module.exports = model('User', User);

const { Schema, model,  } = require('mongoose');


const GroupSpin = new Schema({
    idGroup: {type: Number, unique: true},
    lastSpin: { type: Date, default: Date.now() },
    groupUsers: [{type: String, unique: true}]
});

module.exports = model('GroupSpin', GroupSpin);

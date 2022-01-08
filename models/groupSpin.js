const { Schema, model,  } = require('mongoose');


const GroupSpin = new Schema({
    groupId: {type: Number, unique: true, required: true},
    lastSpin: { type: Date, default: Date.now() },
    groupUsers: [{type: String, unique: true,}]
});

module.exports = model('GroupSpin', GroupSpin);

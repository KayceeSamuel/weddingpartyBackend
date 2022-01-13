const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let weddingSchema = mongoose.Schema({
    Image1: {type: String, required: true},
    Image2: {type: String, required: true},
    Image3: {type: String, required: true},
    NameOfCouple: {type: String, required: true},
    Nickname: {type: String},
    Venue: {type: String},
    Date: {type: Date},
    Time: {type: String},
    Officiating: {
        Lead: String,
        Bridesmaids: String,
        Groomsmen: String
    },
    ServiceSchedule: {
        Processional: String,
        Item2: String,
        Item3: String,
        Item4: String,
        Item5: String,
        Item6: String,
        Item7: String,
        Item8: String,
        Item9: String
    },
    Reading: {type: String},
    Songs: {type: String},
    Reception: {type: String},
    ReceptionTime: {type: String}
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    PlannedWedding: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wedding' }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

let Wedding = mongoose.model('Wedding', weddingSchema);
let User = mongoose.model('User', userSchema);

module.exports.Wedding = Wedding;
module.exports.User = User;
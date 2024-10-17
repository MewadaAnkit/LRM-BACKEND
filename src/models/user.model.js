const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  id: { type: String,  },
  username:{type:String},
  email: { type: String},
  password: { type: String,  },
  firstname: { type: String,},
  lastname: { type: String, },
  mobile: { type: String},
  city: { type: String},
  state: { type: String },
  role:{type:String},
  active: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  date_created: { type: String},
});

const User  = mongoose.model('user', userSchema);
module.exports = User

const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Must be a valid email address'],
    }, 
    password: {
        type: String,
        required: true,
        minlength: 8,
      },
      ownedLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShoppingList',
      }],
      memberedLists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShoppingList',
      }],
    }, {
      timestamps: true,
    });

    // hash user password
    userSchema.pre('save', async function (next) {
        if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        }
  
        next();
    });
    
    // custom method to compare and validate password for logging in
    userSchema.methods.isCorrectPassword = async function (password) {
        return bcrypt.compare(password, this.password);
    };
    
    // when we query a user, we'll also get another field called `bookCount` with the number of saved books we have
    userSchema.virtual('bookCount').get(function () {
        return this.savedBooks.length;
    });
    
    const User = model('User', userSchema);
  
  module.exports = User;
  
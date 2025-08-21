import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new Schema({
    fullname : {type :String, required: true},
    username: {type :String, required: true,unique: true},
    email : {type : String, required :true, unique: true},
    gender:{ type: String, required: true,enum: ['male', 'female']},
    password: { type: String, required: true,},
    profile: { type: String, default: "", },
   
}, {timestamps: true})

//! hashing password before saving to database
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next()
    } catch (error) {
        next(error)
    }
    
})

export const User = model("User", userSchema);


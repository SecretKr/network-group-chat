import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
    nickname:{
        type:String,
        required:[true,'Please add a name']
    },
    username:{
        type:String,
        required:[true,'Please add an Username'],
        unique : true,

    },
    password:{
        type:String,
        required:[true,'please add a password'],
        minlenght : 6,
        select: false
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    createdAt:{
        type: Date,
        default:Date.now
    }
});

//Encrypt password using bcrypt
UserSchema.pre('save',async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this.id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE
    });
}

UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

const User = mongoose.model('User', UserSchema);
export default User;
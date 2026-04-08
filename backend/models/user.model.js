import mongoose, { Mongoose } from "mongoose";

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3        
    },
    fullname: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']        
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    usertype: {
        type: String,
        enum:['Staff Admin','Class Admin','Student','Teacher'],
        required:true
    },
    profileImg: {
        type: String,
        default: ""
    }

}, { timestamps: true })

const User = mongoose.model("User", UserSchema);

export default User
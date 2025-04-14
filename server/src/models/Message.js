import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    chatId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required:true
    },
    text:{
        type: String,
        trim:true,
        required:true
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
});


const Message = mongoose.model('Message', MessageSchema);
export default Message;
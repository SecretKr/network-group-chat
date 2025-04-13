import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
    chatName:{
        type: String,
        trim: true,
    },
    isGroupChat:{
        type: Boolean,
        default: false
    },
    users:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    messages:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ],
    createdAt:{
        type: Date,
        default: Date.now
    }
});


const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
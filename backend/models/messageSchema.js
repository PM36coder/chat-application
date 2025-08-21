import { Schema, model } from "mongoose";

const messageSchema = new Schema({
     senderId : {type : Schema.Types.ObjectId, ref: 'User', required: true},
     receiverId : {type : Schema.Types.ObjectId, ref: 'User', required: true},
     message: { type: String, required: true},
     conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', default: []}

}, {timestamps: true})

export const Message = model('Message', messageSchema)
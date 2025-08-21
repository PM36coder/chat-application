import { Schema , model  } from "mongoose"; 

const conversationSchema = new Schema({
    participants : [{ type : Schema.Types.ObjectId, ref: 'User'}],
    messages : [{ type : Schema.Types.ObjectId, ref: 'Message', required: true }]
},{timestamps: true})

export const Conversation = model('Conversation', conversationSchema)
import { Conversation } from "../models/conversationSchema.js";
import {User} from "../models/usersSchema.js"
export const getUserByUsername = async (req, res)=>{
   
    try {
         const search = req.query.search || ""
    const currentUser = req.user.userId

    if(!search) {
        return res.status(400).json({ msg: "Search query is required" });}

        const user = await User.find({
            $and:[
                {
                    $or :[
                        {username : {$regex: '.*' + search +'.*', $options: "i"}},
                         {fullname : {$regex: '.*' + search +'.*', $options: "i"}}
                    ]
                },
                 { _id: { $ne: currentUser } },
            ]
        }).select("fullname username profile")

        res.status(200).json({users: user})
    } catch (error) {
        res.status(500).json({  msg : "Internal Server Error"})
    }
}

export const getAllUsers = async (req, res)=>{
    try {
        const currentUser = req.user.userId;
        const Chatters = await Conversation.find({
            participants: currentUser}).sort({ updatedAt: -1}).populate("participants", "fullname username profile");

        //! Get all users except the current user
        const users = Chatters.flatMap(chat =>
      chat.participants.filter(participant => participant._id.toString() !== currentUser)
    );

        res.status(200).json({data :users})
        
    }catch (error) {
        res.status(500).json({ msg: "Internal Server Error"})
    }
}
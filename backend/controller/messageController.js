import { Conversation } from "../models/conversationSchema.js";
import { Message } from "../models/messageSchema.js";
import { getReceiverSocketId } from "../socket.io/socket.js";
import { io } from "../socket.io/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;

    // console.log("📨 [Backend] Sending message:");
    // console.log("  - From:", senderId);
    // console.log("  - To:", receiverId);
    // console.log("  - Message:", message);

    let chats = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chats) {
      chats = await Conversation.create({
        participants: [senderId, receiverId],
      });
      // console.log("📝 [Backend] Created new conversation:", chats._id);
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      conversationId: chats._id,
    });

    chats.messages.push(newMessage._id);
    await chats.save();

    // console.log("✅ [Backend] Message saved to database:", newMessage._id);

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    // console.log("🔍 [Backend] Socket IDs:");
    // console.log("  - Receiver:", receiverSocketId);
    // console.log("  - Sender:", senderSocketId);

    const messageToEmit = {
      _id: newMessage._id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      message: newMessage.message,
      conversationId: newMessage.conversationId,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt
    };

    // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageToEmit);
      // console.log("📤 [Backend] Message emitted to receiver");
    } else {
      console.log("⚠️ [Backend] Receiver not online");
    }

    // Emit to sender
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", messageToEmit);
      // console.log("📤 [Backend] Message emitted to sender");
    } else {
      console.log("⚠️ [Backend] Sender socket not found");
    }

    res.status(200).json({ msg: newMessage });
  } catch (error) {
    // console.error("❌ [Backend] sendMessage error:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;

    const chats = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate({
      path: "messages",
      model: "Message",
    });

    if (!chats) return res.status(200).json({ msg: [] });

    const message = Array.isArray(chats.messages) ? chats.messages : [];
    res.status(200).json({ msg: message });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (message.senderId.toString() !== currentUserId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Get conversation details before deleting
    const conversation = await Conversation.findById(message.conversationId);
    
    await Message.findByIdAndDelete(id);

    // Remove message from conversation
    await Conversation.findByIdAndUpdate(
      message.conversationId,
      { $pull: { messages: id } }
    );

    // Emit delete event to both sender and receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(message.senderId);

    // console.log("🗑️ [Backend] Deleting message:", id);
    // console.log("🟡 [Backend] Receiver Socket ID:", receiverSocketId);
    // console.log("🟢 [Backend] Sender Socket ID:", senderSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", id);
      // console.log("🗑️ [Backend] Delete notification sent to receiver");
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", id);
      // console.log("🗑️ [Backend] Delete notification sent to sender");
    }

    res.status(200).json({ msg: "Message Deleted Successfully" });
    
  } catch (error) {
    console.error("deleteMessage error:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
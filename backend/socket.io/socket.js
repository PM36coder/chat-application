// socket.js - Enhanced version with typing support
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://baatgram.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 🔧 userID => socket.id mapping
const userSocketMap = {}; // userId: socketId

// 🔧 typing status tracking
const typingUsers = {}; // receiverId: { senderId: true/false }

// ✅ Get socket ID by user ID
const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// ✅ Get full map (for debugging or external use)
const getUserSocketMap = () => userSocketMap;

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;

    console.log("🟢 [Socket] User connected:", userId);
    console.log("🧠 [Socket] Current userSocketMap:", userSocketMap);

    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle typing events
    socket.on("typing", ({ receiverId, isTyping }) => {
      console.log(`⌨️ [Socket] Typing event: ${userId} -> ${receiverId}, typing: ${isTyping}`);

      const receiverSocketId = getReceiverSocketId(receiverId);
      
      if (receiverSocketId) {
        // Send typing status to receiver
        io.to(receiverSocketId).emit("userTyping", {
          userId: userId,
          isTyping: isTyping
        });
        
        console.log(`⌨️ [Socket] Typing status sent to ${receiverId}: ${isTyping}`);
      } else {
        console.log(`⚠️ [Socket] Receiver ${receiverId} not online for typing event`);
      }

      // Track typing status
      if (!typingUsers[receiverId]) {
        typingUsers[receiverId] = {};
      }
      
      if (isTyping) {
        typingUsers[receiverId][userId] = true;
      } else {
        delete typingUsers[receiverId][userId];
        
        // Clean up empty objects
        if (Object.keys(typingUsers[receiverId]).length === 0) {
          delete typingUsers[receiverId];
        }
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];

        // Clean up typing status for this user
        Object.keys(typingUsers).forEach(receiverId => {
          if (typingUsers[receiverId] && typingUsers[receiverId][userId]) {
            delete typingUsers[receiverId][userId];
            
            // Notify receiver that user stopped typing
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("userTyping", {
                userId: userId,
                isTyping: false
              });
            }
            
            // Clean up empty objects
            if (Object.keys(typingUsers[receiverId]).length === 0) {
              delete typingUsers[receiverId];
            }
          }
        });

        console.log("🔴 [Socket] User disconnected:", userId);
        console.log("🧠 [Socket] Remaining userSocketMap:", userSocketMap);
        console.log("⌨️ [Socket] Remaining typingUsers:", typingUsers);

        // Emit updated online users list
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });

    // Handle manual stop typing (when user sends message)
    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: userId,
          isTyping: false
        });
      }
      
      // Clean up typing status
      if (typingUsers[receiverId] && typingUsers[receiverId][userId]) {
        delete typingUsers[receiverId][userId];
        
        if (Object.keys(typingUsers[receiverId]).length === 0) {
          delete typingUsers[receiverId];
        }
      }
      
      console.log(`⌨️ [Socket] ${userId} manually stopped typing to ${receiverId}`);
    });
  }
});

export { app, io, server, userSocketMap, getReceiverSocketId, getUserSocketMap };
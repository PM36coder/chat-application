import React, { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { useAuth } from "../../store/AuthContext";
import { useConversation } from "../../zustand/useConversation";
import { IoMdArrowRoundBack } from "react-icons/io";

import { MdDelete } from "react-icons/md";
import { useSocketContext } from "../../store/SocketIo";
import { useCallback } from 'react';
import API from "../../utils/Axios";

const Message = ({ onBack }) => {
  const { 
    selectedConversation, 
    messages, 
    setMessages, 
    addMessage, 
    markMessageDeleted,
    clearMessages,
    getCurrentState
  } = useConversation();
  
  const { user } = useAuth();
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const lastMessageRef = useRef();
  const typingTimeoutRef = useRef();
  const { socket, onlineUser } = useSocketContext();
  const isMobile = window.innerWidth < 640;

  // Check if other user is online
  const isUserOnline = selectedConversation && onlineUser.includes(selectedConversation._id);

  // Get messages on load
  const getMessages = useCallback(async () => {
    if (!selectedConversation?._id) return;
    
    setIsLoading(true);
    try {
      console.log("📥 [Frontend] Fetching messages for:", selectedConversation._id);
      const res = await API.get(`/message/get/${selectedConversation._id}`);
      const data = res.data;
      const fetchedMessages = Array.isArray(data.msg) ? data.msg : [];
      
      console.log("📥 [Frontend] Fetched messages:", fetchedMessages);
      setMessages(fetchedMessages);
      
    } catch (err) {
      console.error("❌ [Frontend] Error fetching messages:", err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedConversation?._id, setMessages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConversation?._id) {
      clearMessages();
      setOtherUserTyping(false);
      return;
    }
    
    console.log("🔄 [Frontend] Conversation changed to:", selectedConversation._id);
    getMessages();
  }, [selectedConversation?._id, getMessages, clearMessages]);

  // Socket listeners - FIXED VERSION
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      console.log("💥 [Frontend] Socket message received:", newMessage);
      console.log("🔍 [Frontend] Current conversation:", selectedConversation?._id);
      console.log("🔍 [Frontend] Message conversation:", newMessage.conversationId);
      
      // Check if message belongs to current conversation
      const isForCurrentConversation = selectedConversation && (
        (newMessage.senderId === user?._id && newMessage.receiverId === selectedConversation._id) ||
        (newMessage.senderId === selectedConversation._id && newMessage.receiverId === user?._id)
      );

      if (isForCurrentConversation) {
        console.log("✅ [Frontend] Message belongs to current conversation, adding...");
        addMessage(newMessage);
        
        // Stop typing indicator when message received
        setOtherUserTyping(false);
      } else {
        console.log("❌ [Frontend] Message not for current conversation");
      }
    };

    const handleMessageDeleted = (deletedMessageId) => {
      console.log("🗑️ [Frontend] Message deleted via socket:", deletedMessageId);
      
      // Mark message as deleted instead of removing
      markMessageDeleted(deletedMessageId);
    };

    const handleUserTyping = ({ userId, isTyping: typing }) => {
      console.log("⌨️ [Frontend] Typing status:", { userId, typing });
      
      // Only show typing if it's from the current conversation partner
      if (userId === selectedConversation?._id) {
        setOtherUserTyping(typing);
      }
    };

    // Add event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("userTyping", handleUserTyping);

    return () => {
      // Remove event listeners
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("userTyping", handleUserTyping);
    };
  }, [socket, user?._id, selectedConversation?._id, addMessage, markMessageDeleted]);

  // Debug current state
  useEffect(() => {
    const state = getCurrentState();
    console.log("🎯 [Frontend] Current store state:", {
      selectedConversation: state.selectedConversation?._id,
      messagesCount: state.messages.length,
      messages: state.messages
    });
  }, [messages, getCurrentState]);

  // Scroll to last message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, otherUserTyping]);

  // Handle typing indicator
  const handleTyping = (e) => {
    const value = e.target.value;
    setUserMessage(value);

    if (!socket || !selectedConversation?._id) return;

    // Start typing
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        receiverId: selectedConversation._id,
        isTyping: true
      });
      // console.log("⌨️ [Frontend] Started typing");
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit("typing", {
          receiverId: selectedConversation._id,
          isTyping: false
        });
        console.log("⌨️ [Frontend] Stopped typing");
      }
    }, 2000);

    // Stop typing immediately if input is empty
    if (!value.trim() && isTyping) {
      setIsTyping(false);
      socket.emit("typing", {
        receiverId: selectedConversation._id,
        isTyping: false
      });
      console.log("⌨️ [Frontend] Stopped typing (empty input)");
    }
  };

  // Send text message
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading || !selectedConversation?._id) return;
    
    const messageToSend = userMessage.trim();
    setUserMessage("");
    
    // Stop typing when sending message
    if (isTyping) {
      setIsTyping(false);
      socket.emit("typing", {
        receiverId: selectedConversation._id,
        isTyping: false
      });
    }
    
    // console.log("📤 [Frontend] Sending text message:", messageToSend);
    
    try {
      await API.post(
        `/message/send/${selectedConversation._id}`,
        {
          message: messageToSend,
          receiverId: selectedConversation._id,
        },
        { withCredentials: true }
      );
      
      // console.log("✅ [Frontend] Text message sent successfully:", response.data);
      
      // Don't manually add message here - let socket handle it
      
    } catch (error) {
      console.error("❌ [Frontend] Failed to send message:", error);
      setUserMessage(messageToSend);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    console.log("🗑️ [Frontend] Deleting message:", messageId);
    
    try {
      await API.delete(`/message/delete/${messageId}`, { withCredentials: true });
      // console.log("✅ [Frontend] Message deleted successfully");
      
      // Don't manually update UI here - let socket handle it
      
    } catch (err) {
      console.error("❌ [Frontend] Error deleting message:", err);
      // If delete failed, refresh messages
      getMessages();
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedConversation) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white text-xl">Select a conversation to start</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Online Status */}
      <div className="flex items-center gap-3 p-3 bg-blue-300 rounded-xl mb-4">
        {isMobile && (
          <button onClick={onBack} className="text-white text-sm">
            <IoMdArrowRoundBack size={30} className="hover:text-black hover:rotate-10 transition-all" />
          </button>
        )}
        
        {/* Profile with Online Indicator */}
        <div className="relative">
          <img
            src={selectedConversation.profile || user.profile}
            alt={selectedConversation.username}
            className="w-8 h-8 rounded-full"
          />
          {/* Online Status Dot */}
          {isUserOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-lg font-medium text-white">
            {selectedConversation.fullname}
          </h1>
          {/* Online/Offline Status */}
          <p className="text-xs text-white/80">
            {isUserOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 bg-gray-800/50 rounded-xl p-4 min-h-[100px] md:max-h-[500px] overflow-auto space-y-3">
        {isLoading ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : Array.isArray(messages) && messages.length === 0 ? (
          <p className="text-gray-400 text-center">
            Start your conversation with {selectedConversation.fullname}
          </p>
        ) : (
          Array.isArray(messages) &&
          messages.map((msg, index) => {
            const isSenderMe = msg.senderId === user._id;
            const isDeleted = msg.isDeleted || false;
            
            return (
              <div
                key={msg._id}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={`flex items-start gap-2 ${
                  isSenderMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isSenderMe && (
                  <img
                    src={selectedConversation.profile}
                    alt={selectedConversation.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="relative group max-w-[80%]">
                  <div
                    className={`px-4 py-2 rounded-xl shadow-md break-words ${
                      isDeleted 
                        ? "bg-gray-300 text-gray-600 italic border-2 border-dashed border-gray-400"
                        : isSenderMe
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    <h1 className={`text-base ${isDeleted ? "italic" : "font-medium"}`}>
                      {msg.message}
                    </h1>
                    <p className="text-[10px] text-right opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Delete button - only show for non-deleted messages from sender */}
                  {isSenderMe && !isDeleted && (
                    <button
                      className="absolute -top-2 -right-5 text-red-500 text-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                      title="Delete message"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex items-start gap-2 justify-start">
            <img
              src={selectedConversation.profile}
              alt={selectedConversation.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-gray-200 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {selectedConversation.fullname} is typing...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-xl relative">
        <textarea
          placeholder="Type a message..."
          rows={2}
          value={userMessage}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-white placeholder-gray-400 outline-none pr-10 scrollbar-hide disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!userMessage.trim() || isLoading}
          className="absolute top-1/2 -translate-y-1/2 right-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoSend className="text-2xl text-red-700 hover:scale-110 transition-transform" size={30} />
        </button>
      </div>
    </div>
  );
};

export default Message;
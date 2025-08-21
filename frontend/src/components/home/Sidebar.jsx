import axios from "axios";
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoMdArrowRoundBack } from "react-icons/io";
import { toast } from "react-toastify";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { useConversation } from "../../zustand/useConversation";
import { useSocketContext } from "../../store/SocketIo";
import ProfileModal from "../../pages/Profile";

const Sidebar = ({ onSelectUser }) => {
  const [userSearch, setSearchUser] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { onlineUser } = useSocketContext(); // Get online users from socket context

  const {
    selectedConversation,
    setSelectedConversation,
  } = useConversation();

  // Fetch conversation users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/users/search/users", {
          withCredentials: true,
        });
        setUsers(res.data.data || []);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error("Failed to load users");
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  // Handle user search
  const handleSearchUser = async () => {
    if (!query.trim()) return toast.error("Enter a username");
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/search?search=${query}`, {
        withCredentials: true,
      });
      if (res.data.users.length === 0) toast.info("No user found");
      setSearchUser(res.data.users || []);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Search failed");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const res = await axios.get("/api/user/logout", { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user");
      toast.success(res.data.msg || "Logout Successful");
      navigate("/login");
    } catch (error) {
      toast.error("Logout Failed", error);
    }
  };

  const handleGoBack = () => {
    setSearchUser([]);
    setQuery("");
  };

  const handleSelectUser = (user) => {
    if (selectedConversation?._id === user._id) {
      setSelectedConversation(null);
    } else {
      setSelectedConversation(user);
      onSelectUser(user);
    }
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUser.includes(userId);
  };

  const renderUserItem = (user) => {
    const isOnline = isUserOnline(user._id);
    const isSelected = selectedConversation?._id === user._id;

    return (
      <div
        key={user._id}
        onClick={() => handleSelectUser(user)}
        className={`rounded-lg p-2 text-white flex items-center gap-3 cursor-pointer transition-all ${
          isSelected ? "bg-blue-500" : "hover:bg-white/10"
        }`}
      >
        {/* Profile Picture with Online Status */}
        <div className="relative">
          <img 
            src={user.profile} 
            alt={user.username} 
            className="w-8 h-8 rounded-full object-cover" 
          />
          {/* Online Status Indicator */}
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold italic block truncate">{user.fullname}</p>
            {/* Online/Offline Text Status */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isOnline 
                ? "bg-green-500/20 text-green-300" 
                : "bg-gray-500/20 text-gray-400"
            }`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <p className="text-sm text-white/70 truncate">@{user.username}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full p-2">
      {/* Search bar */}
      <div className="flex gap-4 items-center justify-between">
        <div className="relative w-full mb-3">
          <input
            type="text"
            value={query}
            placeholder="Search user..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchUser();
              }
            }}
            className="w-full bg-white/20 text-white placeholder-white/80 rounded-lg p-2 pr-10 border border-white/30"
          />
          <button onClick={handleSearchUser} className="absolute top-1/2 -translate-y-1/2 right-3 text-white">
            <CiSearch className="text-2xl" />
          </button>
        </div>
        
        {/* Current User Profile with Online Status */}
        <div className="relative">
          <img    
            src={user.profile}
            alt={user.username}
            className="w-10 h-10 rounded-full cursor-pointer object-cover"
            onClick={() => setShowModal(true)}
          />
          {/* Current user is always online */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        {showModal && (
          <ProfileModal
            user={user}
            setUser={setUser}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      {/* Online Users Count */}
      <div className="mb-4 text-center">
        <p className="text-white/70 text-sm">
          {onlineUser.length} user{onlineUser.length !== 1 ? 's' : ''} online
        </p>
      </div>

      {/* Search Results */}
      <div className="space-y-2">
        {userSearch.map(renderUserItem)}

        {userSearch.length > 0 && (
          <div className="mt-auto px-1 py-1 flex hover:bg-white/10 w-[50px] rounded-2xl" onClick={handleGoBack}>
            <IoMdArrowRoundBack size={45} />
          </div>
        )}
      </div>

      {/* Conversation List */}
      {!userSearch.length && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white text-xl">Conversations</h1>
            {/* Filter buttons */}
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300">
                Online ({users.filter(u => isUserOnline(u._id)).length})
              </button>
              <button className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">
                All ({users.length})
              </button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <p className="text-white text-center">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-white text-xl text-center">Search for people to start a conversation</p>
            ) : (
              // Sort users - online users first
              users
                .sort((a, b) => {
                  const aOnline = isUserOnline(a._id);
                  const bOnline = isUserOnline(b._id);
                  if (aOnline && !bOnline) return -1;
                  if (!aOnline && bOnline) return 1;
                  return 0;
                })
                .map(renderUserItem)
            )}
          </div>

          {/* Logout */}
          <div className="pt-4 mt-auto px-1 py-1 flex">
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 p-2 text-white w-full rounded-lg">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
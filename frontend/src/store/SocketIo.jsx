import { useContext,createContext,useState } from 'react'

import io from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useEffect } from 'react'

const SocketContext = createContext()




export const SocketProvider = ({children})=>{
const [socket, setSocket] = useState(null)
const [onlineUser,setOnlineUser] =useState([])
const {user}= useAuth()

useEffect(() => {
  let newSocket;

  if (user && user._id) {
    newSocket = io("http://localhost:3000", {
      query: { userId: user._id }
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });

    setSocket(newSocket);
  }

  return () => {
    if (newSocket) newSocket.close();
  };
}, [user]);


return (<SocketContext.Provider value={{socket,onlineUser}}>{children}</SocketContext.Provider>)
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = ()=>{
    return useContext(SocketContext)
}
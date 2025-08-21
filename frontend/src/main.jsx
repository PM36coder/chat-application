import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './store/AuthContext.jsx'
import { SocketProvider } from './store/SocketIo.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
      <App />
       <ToastContainer position="top-left" autoClose={3000} />
       </SocketProvider>
       </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

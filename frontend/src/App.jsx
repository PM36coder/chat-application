
import './App.css'
import { Home } from './components/Home';
import ProtectedRoute from './components/Protectd';
import Login from './pages/Login'
import Register from './pages/Registration'
import { Routes, Route } from 'react-router-dom';

function App() {
 

  return (
    <>
    <Routes>
      <Route path='/' element={<ProtectedRoute ><Home/></ProtectedRoute> }/>
      <Route path="/login" element={ <Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  

    </>
  )
}

export default App

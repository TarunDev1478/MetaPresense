

import './App.css'
import Game from './Components/Game.tsx'
import Login from './Components/Login'
import Signup from './Components/Signup'
import Home from './Components/Home'
import NavBar from './Components/NavBar'
import About from './Components/About.tsx'
import { Routes } from 'react-router-dom'
import Contact from './Components/Contact.tsx'
import {  Route, useLocation } from "react-router-dom";
import Explore from './Components/Explore.tsx'

function App() {
  const location = useLocation();
  const path = location.pathname;
  const token =localStorage.getItem('token')
  
  return (
    <>
      {(path === '/login' || path === '/signup' || path.startsWith('/game')) ? null : <NavBar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/about' element={token?<About/>:<Login/>}/>
        <Route path='/explore' element={token?<Explore/>:<Login/>}/>
        <Route path='/game' element={token?<Game/>:<Login/>} />
        <Route path='/contact' element={token?<Contact/>:<Login/>}/>
      </Routes>
    </>
  )
}

export default App
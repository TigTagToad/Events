import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './pages/home'
import {Header} from './pages/header'
import { Route, Routes } from 'react-router-dom'
import SignInScreen from './pages/signIn'
import { BrowserRouter } from 'react-router-dom'
function App() {
 

  return (
      <BrowserRouter>
    <div>
      <Header/>

    </div>
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/signin" element={<SignInScreen />} />

    </Routes>
    </BrowserRouter>
  )
}

export default App

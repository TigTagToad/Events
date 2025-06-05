
import './App.css'
import Home from './pages/home'
import {Header} from './pages/header'
import { Route, Routes } from 'react-router-dom'
import SignInScreen from './pages/signInPage'
import SignUpScreen from './pages/signUpPage'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "./contexts/authContext"
function App() {
 

  return (
      <AuthProvider>

      <BrowserRouter>
    <div>
      <Header/>

    </div>
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/signup" element={<SignUpScreen />} />
      <Route path="/signin" element={<SignInScreen />} />

    </Routes>
    </BrowserRouter>
      </AuthProvider>
  )
}

export default App

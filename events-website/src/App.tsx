
import './App.css'
import Home from './pages/home'
import {Header} from './pages/header'
import { Route, Routes } from 'react-router-dom'
import SignInScreen from './pages/signInPage'
import SignUpScreen from './pages/signUpPage'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "./contexts/authContext"
import  EventPage from './pages/event'
import AdminSignUpScreen from './pages/adminSignUpPage'
import CreateEvents from './pages/createEvent'
import 'bootstrap/dist/css/bootstrap.min.css';
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
      <Route path="/signup-admin" element={<AdminSignUpScreen />} />
      <Route path='/events/:event_id' element={<EventPage />}/>
      <Route path='/create-event' element={<CreateEvents/>}/>
    </Routes>
    </BrowserRouter>
      </AuthProvider>
  )
}

export default App

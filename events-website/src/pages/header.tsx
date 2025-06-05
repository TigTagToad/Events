
import {Link} from "react-router-dom"
import { useAuth } from '../contexts/authContext'


export const Header =() =>{
    const { userProfile, userLoggedIn, logout } = useAuth()
    
    const handleLogout = async () => {
        try {
            await logout()
            // Optionally redirect to home page or show success message
        } catch (error) {
            console.error('Failed to log out:', error)
            // Handle error (show toast, etc.)
        }
    }

   return (
        <header id="nav-header">
            <h1>Welcome, {userProfile?.username || 'Lurker'}!</h1>
           
            <nav>
                <Link to="/home" className="nav-link"> Home </Link>
                
                {userLoggedIn ? (
                    <>
                        {/* <Link to="/profile" className="nav-link">Profile</Link>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link> */}
                        <button 
                            onClick={handleLogout} 
                            className="nav-link logout-btn"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/signin" className="nav-link"> Sign In </Link>

                    </>
                )}
            </nav>
        </header>
    )
    
    }


import {Link} from "react-router-dom"
import { useAuth } from '../contexts/authContext'

export const Header = () => {
    const { userProfile, userLoggedIn, loading, logout } = useAuth()
    
    const handleLogout = async () => {
        try {
            await logout()
            // Optionally redirect to home page or show success message
        } catch (error) {
            console.error('Failed to log out:', error)
            // Handle error (show toast, etc.)
        }
    }
    
    // Show loading state while auth is initializing
    const getWelcomeMessage = () => {
        if (loading) return "Loading..."
        if (userLoggedIn && userProfile?.username) return userProfile.username
        if (userLoggedIn) return "User"
        return "Lurker"
    }
    
    return (
        <header id="nav-header">
            <h1>Welcome, {getWelcomeMessage()}!</h1>
           
            <nav>
                <Link to="/home" className="nav-link"> Home </Link>
                
                {userLoggedIn ? (
                    <>
                    
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


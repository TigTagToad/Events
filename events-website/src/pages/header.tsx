import {Link, useLocation} from "react-router-dom"
import { useAuth } from '../contexts/authContext'

export const Header = () => {
    const { userProfile, userLoggedIn, loading, logout } = useAuth()
    const location = useLocation()
    
    // Check if user is admin
    const isAdmin = userProfile?.admin || false
    
    // Check if currently on create-event page
    const isOnCreateEventPage = location.pathname === '/create-event'
    
    const handleLogout = async () => {
        try {
            await logout()
            // Optionally redirect to home page or show success message
        } catch (error) {
            console.error('Failed to log out:', error)
            // Handle error (show toast, etc.)
        }
    }
    
    // Show a neutral message during loading instead of "Loading..."
    const getWelcomeMessage = () => {
        if (loading) return "Welcome!" // Generic message while loading
        if (userLoggedIn && userProfile?.username) return userProfile.username
        if (userLoggedIn) return "User"
        return "Lurker"
    }
    
    return (
        <header id="nav-header">
            <h1>
                Welcome, {getWelcomeMessage()}!
                {!loading && userLoggedIn && isAdmin && (
                    <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '14px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontWeight: 'normal'
                    }}>
                        Admin
                    </span>
                )}
            </h1>
           
            <nav>
                <Link to="/home" className="nav-link"> Home </Link>
                
                {!loading && userLoggedIn && isAdmin && !isOnCreateEventPage && (
                    <Link to="/create-event" className="nav-link"> Create Event </Link>
                )}
                
                {!loading && (
                    userLoggedIn ? (
                        <button 
                            onClick={handleLogout} 
                            className="nav-link logout-btn"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link to="/signin" className="nav-link"> Sign In </Link>
                    )
                )}
            </nav>
        </header>
    )
}
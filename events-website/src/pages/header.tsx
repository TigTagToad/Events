import {Link, useLocation} from "react-router-dom"
import { useAuth } from '../contexts/authContext'
import { Button, Container, Row} from "react-bootstrap"



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
        <Container className="mt-5">
            <Row>
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
                            fontWeight: 'normal',
                            maxWidth: '100%'
                        }}>
                            Admin
                        </span>
                    )}
                </h1>
            </Row>
            <Row>
                <div className="navbar navbar-expand-lg justify-content-center">
                    <div className="navbar-nav flex-wrap">
                        <Link to="/home" className="nav-link"> Home </Link>
                        
                        {!loading && userLoggedIn && isAdmin && !isOnCreateEventPage && (
                            <>
                                <Link to="/create-event" className="nav-link"> Create Event </Link>
                                <Link to="/signup-admin" className="nav-link"> Create New Admin </Link>
                            </>
                        )}
                        
                        {!loading && (
                            userLoggedIn ? (
                                <button className="btn btn-outline-danger"
                                    onClick={handleLogout} 
                                    
                                >
                                    Sign Out
                                </button>
                            ) : (
                                
                                    <Link to="/signin" className="nav-link"> Sign In </Link>
                            
                            )
                        )}
                    </div>
                </div>
            </Row>
        </Container>
        </header>
    )
}
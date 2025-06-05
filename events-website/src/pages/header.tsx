
import {Link} from "react-router-dom"
import { useAuth } from '../contexts/authContext'

export const Header =() =>{
    const { currentUser } = useAuth()
    return (
        
        <header id="nav-header">
            <h1>Welcome, {currentUser?.username || 'Lurker'}!</h1>
           
        <nav>
            <Link to="/home" className="nav-link"> home </Link>
            <Link to="/signin" className="nav-link"> sign in </Link>


        </nav>
    </header>
    )
    
    }


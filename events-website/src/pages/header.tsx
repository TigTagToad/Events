
import {Link} from "react-router-dom"

export const Header =() =>{
    return (
        <header id="nav-header">
        <nav>
            <Link to="/home" className="nav-link"> home </Link>
            <Link to="/signin" className="nav-link"> sign in </Link>

        </nav>
    </header>
    )
    
    }


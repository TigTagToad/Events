import React, { useState} from 'react'
import type { FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../utils/firebase'

const SignInScreen: React.FC = () => {
    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isSigningIn, setIsSigningIn] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSigningIn) {
        setIsSigningIn(true)
        setErrorMessage('')  
        try {                
            await signInWithEmailAndPassword(auth, email, password)
            // Context will automatically update via Firebase listener
        } catch (error: any) {           
            setErrorMessage(error.message)  
            setIsSigningIn(false)         
        }
    }
    }



    if (userLoggedIn) {
        
        return <Navigate to="/home" replace />
    }

    return (
        
            <div>
                <div>
                    <h3>Welcome Back</h3>
                </div>

                <form onSubmit={onSubmit}>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {errorMessage && (
                        <span>{errorMessage}</span>
                    )}

                    <button
                        type="submit"
                        disabled={isSigningIn}
                    >
                        {isSigningIn ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p>
                    Don't have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                </p>


            </div>
    
    )
}

export default SignInScreen
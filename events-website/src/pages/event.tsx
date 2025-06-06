import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import supabase from "../utils/supabase"
import { useAuth } from "../contexts/authContext"

const EventPage = () => {
  const { event_id } = useParams()
  const { userProfile } = useAuth()
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attending, setAttending] = useState<boolean>(false)
  const [signUpLoading, setSignUpLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  // Generate signup ID
  const getSignUpId = () => {
    if (event_id && userProfile?.firebase_uid) {
      return event_id + userProfile.firebase_uid
    }
    return null
  }

  const handleEventSignUp = async () => {
    if (!event_id || !userProfile) {
      navigate('/signin', { replace: true })
      return
    }

    setSignUpLoading(true)
    
    try {
      const signUpId = getSignUpId()
      if (!signUpId) return

      // Check if already signed up
      if (attending) {
        // Optional: Handle unsigning up
        const { error: deleteError } = await supabase
          .from('Signups')
          .delete()
          .eq('signup_id', signUpId)
        
        if (!deleteError) {
          setAttending(false)
        }
      } else {
        // Sign up for event
        const date = new Date().toISOString().split('T')[0] // Better date format: YYYY-MM-DD
        
        const { data, error } = await supabase
          .from('Signups')
          .insert([
            { 
              signup_id: signUpId, 
              event_id: event_id, 
              signup_date: date, 
              user_id: userProfile.firebase_uid
            },
          ])
          .select()

        if (error) {
          console.error('Error signing up for event:', error)
          setFetchError('Could not sign up for event')
        } else {
          setAttending(true)
        }
      }
    } catch (error) {
      console.error('Error in handleEventSignUp:', error)
      setFetchError('An error occurred while processing your request')
    } finally {
      setSignUpLoading(false)
    }
  }

  // Check if user is already signed up
  useEffect(() => {
    const fetchSignUp = async () => {
      const signUpId = getSignUpId()
      if (!signUpId) return

      try {
        const { data, error } = await supabase
          .from('Signups')
          .select('*')
          .eq('signup_id', signUpId)
          .single()
        
        if (data && !error) {
          setAttending(true)
        }
      } catch (error) {
        // User not signed up - this is expected behavior
        console.log('User not signed up for this event')
      }
    }
    
    if (userProfile && event_id) {
      fetchSignUp()
    }
  }, [event_id, userProfile])

  // Fetch event details
  useEffect(() => {
    const fetchEvents = async () => {
      if (!event_id) return
      
      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('Events')
          .select('*')
          .eq('event_id', event_id)
          .single()
        
        if (error) {
          setFetchError('Could not fetch event')
          setEvent(null)
          console.log(error)
        } else {
          setEvent(data)
          setFetchError(null)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        setFetchError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [event_id])

  // Loading state
  if (loading) {
    return <div>Loading...</div>
  }

  // Error state
  if (fetchError) {
    return <div className="error">{fetchError}</div>
  }

  // No event found
  if (!event) {
    return <div>Event not found</div>
  }

  // Render event
  return (
    <div className="event-card">
      <h3>{event.event_name}</h3>
      <p>{event.event_date}</p>
      <p>{event.event_dsc}</p>
      <h4>City: {event.event_location}</h4>
      <button 
        onClick={handleEventSignUp}
        disabled={signUpLoading}
      >
        {signUpLoading 
          ? 'Processing...' 
          : attending 
            ? 'Cancel Attendance' 
            : 'Attend Event'
        }
      </button>
      {attending && (
        <p style={{ color: 'green', marginTop: '10px' }}>
          ✓ You are registered for this event
        </p>
      )}
    </div>
  )
}

export default EventPage
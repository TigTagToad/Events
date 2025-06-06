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
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editLoading, setEditLoading] = useState<boolean>(false)
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
  const [editForm, setEditForm] = useState({
    event_name: '',
    event_date: '',
    event_dsc: '',
    event_location: ''
  })
  const navigate = useNavigate()

  // Check if user is admin (assuming there's an is_admin field in userProfile)
  const isAdmin = userProfile?.admin || false

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

  const handleEditEvent = async () => {
    if (!event_id || !isAdmin) return

    setEditLoading(true)

    try {
      const { data, error } = await supabase
        .from('Events')
        .update({
          event_name: editForm.event_name,
          event_date: editForm.event_date,
          event_dsc: editForm.event_dsc,
          event_location: editForm.event_location
        })
        .eq('event_id', event_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating event:', error)
        setFetchError('Could not update event')
      } else {
        setEvent(data)
        setIsEditing(false)
        setFetchError(null)
      }
    } catch (error) {
      console.error('Error in handleEditEvent:', error)
      setFetchError('An error occurred while updating the event')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event_id || !isAdmin) return

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.event_name}"? This action cannot be undone.`
    )
    
    if (!confirmDelete) return

    setDeleteLoading(true)

    try {
      // First delete all signups for this event
      const { error: signupError } = await supabase
        .from('Signups')
        .delete()
        .eq('event_id', event_id)

      if (signupError) {
        console.error('Error deleting signups:', signupError)
        setFetchError('Could not delete event signups')
        return
      }

      // Then delete the event
      const { error: eventError } = await supabase
        .from('Events')
        .delete()
        .eq('event_id', event_id)

      if (eventError) {
        console.error('Error deleting event:', eventError)
        setFetchError('Could not delete event')
      } else {
        // Navigate back to events list or homepage
        navigate('/events', { replace: true })
      }
    } catch (error) {
      console.error('Error in handleDeleteEvent:', error)
      setFetchError('An error occurred while deleting the event')
    } finally {
      setDeleteLoading(false)
    }
  }

  const startEditing = () => {
    setEditForm({
      event_name: event.event_name || '',
      event_date: event.event_date || '',
      event_dsc: event.event_dsc || '',
      event_location: event.event_location || ''
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({
      event_name: '',
      event_date: '',
      event_dsc: '',
      event_location: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
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
      {isEditing ? (
        // Edit form
        <div className="edit-form">
          <input
            type="text"
            name="event_name"
            value={editForm.event_name}
            onChange={handleInputChange}
            placeholder="Event Name"
            style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <input
            type="date"
            name="event_date"
            value={editForm.event_date}
            onChange={handleInputChange}
            style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <textarea
            name="event_dsc"
            value={editForm.event_dsc}
            onChange={handleInputChange}
            placeholder="Event Description"
            rows={4}
            style={{ marginBottom: '10px', padding: '8px', width: '100%', resize: 'vertical' }}
          />
          <input
            type="text"
            name="event_location"
            value={editForm.event_location}
            onChange={handleInputChange}
            placeholder="Event Location"
            style={{ marginBottom: '15px', padding: '8px', width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleEditEvent}
              disabled={editLoading}
              style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={cancelEditing}
              disabled={editLoading}
              style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Display event
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>{event.event_name}</h3>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={startEditing}
                  style={{ 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    padding: '6px 12px', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  Edit Event
                </button>
                <button 
                  onClick={handleDeleteEvent}
                  disabled={deleteLoading}
                  style={{ 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    padding: '6px 12px', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    opacity: deleteLoading ? 0.6 : 1
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            )}
          </div>
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
        </>
      )}
    </div>
  )
}

export default EventPage
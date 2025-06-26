import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../utils/supabase"
import { useAuth } from "../contexts/authContext"
import { v4 as uuidv4 } from 'uuid';
import Loading from "../components/SpinnerLoader";

const CreateEvents = () => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [createLoading, setCreateLoading] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    event_name: '',
    event_date: '',
    event_dsc: '',
    event_location: '',
    venue: '',
    start_time: '',
    end_time: ''
  })

 const [pageLoading, setPageLoading] = useState<boolean>(true)
  useEffect(() => {
  
          setTimeout(() => setPageLoading(false), 330)
      }, [])
      if (pageLoading) {
          return <Loading/>
      }
  // Check if user is admin
  const isAdmin = userProfile?.admin || false

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateEventId = () => {
  return uuidv4()
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAdmin) {
      setCreateError('You must be an admin to create events')
      return
    }

    // Basic validation
    if (!createForm.event_name.trim() || !createForm.event_date) {
      setCreateError('Event name and date are required')
      return
    }

    setCreateLoading(true)
    setCreateError(null)

    try {
      const eventId = generateEventId()
      
      const { data, error } = await supabase
        .from('Events')
        .insert([
          {
            event_id: eventId,
            event_name: createForm.event_name.trim(),
            event_date: createForm.event_date,
            event_dsc: createForm.event_dsc.trim(),
            event_location: createForm.event_location.trim(),
            venue: createForm.venue.trim(),
            start_time: createForm.start_time || null,
            end_time: createForm.end_time || null,
            staff_id: userProfile?.firebase_uid || null
          }
        ])
        .select()
        .single()
        
     if(data){
        console.log("sucess")
     }

      if (error) {
        console.error('Error creating event:', error)
        setCreateError('Could not create event. Please try again.')
      } else {
        // Reset form
        setCreateForm({
          event_name: '',
          event_date: '',
          event_dsc: '',
          event_location: '',
          venue: '',
          start_time: '',
          end_time: ''
        })
        
        // Navigate to the created event or events list
        navigate(`/events/${eventId}`, { replace: true })
      }
    } catch (error) {
      console.error('Error in handleCreateEvent:', error)
      setCreateError('An unexpected error occurred while creating the event')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form and navigate back
    setCreateForm({
      event_name: '',
      event_date: '',
      event_dsc: '',
      event_location: '',
      venue: '',
      start_time: '',
      end_time: ''
    })
    setCreateError(null)
    navigate('/home', { replace: true })
  }

  // Container style for centering
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2px',
    boxSizing: 'border-box' as const
  }

  // Card style with max width for better readability
  const cardStyle = {
    maxWidth: '600px',
    width: '90%',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: 'white'
  }

  // If user is not admin, show access denied
  if (!isAdmin) {
    return (
      <div style={containerStyle}>
        <div className="event-card" style={cardStyle}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Access Denied</h3>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>You must be an admin to create events.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/home')}
              style={{ 
                backgroundColor: '#2196F3', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  } else {
     return (
        <div style={containerStyle}>
          <div className="event-card" style={cardStyle}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Create New Event</h3>
            
            {createError && (
              <div style={{ 
                color: '#f44336', 
                backgroundColor: '#ffebee', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {createError}
              </div>
            )}
    
            <form onSubmit={handleCreateEvent} className="create-form">
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    Event Name*
              </label>
              <input
                type="text"
                name="event_name"
                value={createForm.event_name}
                onChange={handleInputChange}
                placeholder="Event Name *"
                required
                style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    Event Date*
              </label>
              <input
                type="date"
                name="event_date"
                value={createForm.event_date}
                onChange={handleInputChange}
                required
                style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={createForm.start_time}
                    onChange={handleInputChange}
                    placeholder="Start Time"
                    style={{ 
                      padding: '8px', 
                      width: '100%',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={createForm.end_time}
                    onChange={handleInputChange}
                    placeholder="End Time"
                    style={{ 
                      padding: '8px', 
                      width: '100%',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    Event Description
              </label>
              <textarea
                name="event_dsc"
                value={createForm.event_dsc}
                onChange={handleInputChange}
                placeholder="Event Description"
                rows={4}
                style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  width: '100%', 
                  resize: 'vertical',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    Event Location
              </label>
              <input
                type="text"
                name="event_location"
                value={createForm.event_location}
                onChange={handleInputChange}
                placeholder="City/Location"
                style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                    Venue
              </label>
              <input
                type="text"
                name="venue"
                value={createForm.venue}
                onChange={handleInputChange}
                placeholder="Venue"
                style={{ 
                  marginBottom: '15px', 
                  padding: '8px', 
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              
              <div style={{ display: 'flex', gap: '10px',  justifyContent: 'center' }}>
                <button 
                  type="submit"
                  disabled={createLoading}
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                    opacity: createLoading ? 0.6 : 1
                  }}
                >
                  {createLoading ? 'Creating Event...' : 'Create Event'}
                </button>
                
                <button 
                  type="button"
                  onClick={handleCancel}
                  disabled={createLoading}
                  style={{ 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                    opacity: createLoading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              * Required fields
            </p>
          </div>
        </div>
      )
    
      }
     

}

export default CreateEvents
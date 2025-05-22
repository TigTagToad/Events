import EventCard from '../components/EventCard'
import { useState, useEffect } from 'react';
import  supabase  from "../utils/supabase"

export default function Home() {
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [events, setEvents] = useState<any>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('Events')
        .select()

      if (error) {
        setFetchError('could not fetch events')
        setEvents(null)
        console.log(error)
      }
      if (data) {
        setEvents(data)
        setFetchError(null)
      }
    }
    fetchEvents()
  }, [])

  return (
    
      <div style={styles.container}>
        <div>
          {fetchError && (<p>{fetchError}</p>)}
          {events && (
            <div className='events'>
              {/*sign up buttons*/}
              <div style={styles.eventsGrid}>
                {events.map((eventlisting: any) => (
                  <EventCard key={eventlisting.event_id} eventlisting={eventlisting} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    
  );
}

const styles = {
  scrollContainer: {
    height: '100vh',
    overflowY: 'auto' as const,
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsGrid: {
    flex: 4,
    margin: '0 auto',
    width: 400,
  }
};
import { Link } from "react-router-dom"
import { type EventListing } from "../types/eventListing"

// Define the props interface
interface EventCardProps {
    eventlisting: EventListing; // Fixed: lowercase 'eventlisting', correct type
}

const EventCard = ({ eventlisting }: EventCardProps) => { // Fixed: removed duplicate type annotation
    


    return (
        <div className="event-card">
            <h3>{eventlisting.event_name}</h3>
            <p>{eventlisting.event_date}</p>
            <h4>City: {eventlisting.event_location}</h4>
            <div>
                <Link to={`/events/${eventlisting.event_id}`} key={eventlisting.event_id}>
                    see More
                </Link>
            </div>
        </div>
    )
}

export default EventCard
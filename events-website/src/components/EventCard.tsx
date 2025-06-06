import { Link } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

const EventCard = ({ eventlisting }) => {
    const { userProfile } = useAuth()

    return (
        <div className="event-card">
            <h3>{eventlisting.event_name}</h3>
            <p>{eventlisting.event_date}</p>
            {userProfile?.admin === 'true' ? (
    <button>edit</button>
) : null}
            {/* <p>{eventlisting.event_dsc}</p> */}
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
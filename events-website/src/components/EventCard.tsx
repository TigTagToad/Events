const EventCard = ({eventlisting}) => {
    return (
        <div className="event-card">
            <h3>{eventlisting.event_name}</h3>
            <p>{eventlisting.event_date}</p>
            <p>{eventlisting.event_dsc}</p>
            <h4>City: {eventlisting.event_location}</h4>

        </div>
    )
}

export default EventCard
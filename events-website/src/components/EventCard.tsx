import { Link } from "react-router-dom"
import { type EventListing } from "../types/eventListing"
import Card from 'react-bootstrap/Card';
import { Button } from "react-bootstrap";

// Define the props interface
interface EventCardProps {
    eventlisting: EventListing; // Fixed: lowercase 'eventlisting', correct type
}

const EventCard = ({ eventlisting }: EventCardProps) => { // Fixed: removed duplicate type annotation



    return (
        <Card 
        border="light"
        text="light"
        bg="dark"
        className="mb-2"
        style={{ width: '18rem', height: '10rem'}}>
            <Card.Body>

            <Card.Title>{eventlisting.event_name}</Card.Title>
            <Card.Text>{eventlisting.event_date}</Card.Text>
            <Card.Subtitle >City: {eventlisting.event_location}</Card.Subtitle>
            <Card.Link>
                <Button variant="info">

                <Link to={`/events/${eventlisting.event_id}`} key={eventlisting.event_id}>
                    see More
                </Link>
                </Button>
            </Card.Link>
            </Card.Body>
        </Card>
    )
}

export default EventCard
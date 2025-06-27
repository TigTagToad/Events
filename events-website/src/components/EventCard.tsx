import { Link } from "react-router-dom"
import { type EventListing } from "../types/eventListing"
import Card from 'react-bootstrap/Card';
import { Button } from "react-bootstrap";

// Define the props interface
interface EventCardProps {
    eventlisting: EventListing;
}

const EventCard = ({ eventlisting }: EventCardProps) => {
    return (
        <Card 
    border="light"
    text="light"
    bg="dark"
    className="h-100 w-100"
    style={{ 
        maxWidth: '100%',
        height: '260px' // Set a fixed height (adjust as needed)
    }}
>
            <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-2">{eventlisting.event_name}</Card.Title>
                <Card.Text className="mb-2">{eventlisting.event_date}</Card.Text>
                <Card.Subtitle className="mb-3">City: {eventlisting.event_location}</Card.Subtitle>
                
                {/* Push button to bottom of card */}
                <div className="mt-auto">
                    <Button variant="info" size="sm" className="w-100">
                        <Link 
                            to={`/events/${eventlisting.event_id}`} 
                            key={eventlisting.event_id}
                            className="text-decoration-none"
                            style={{ color: 'inherit' }}
                        >
                            See More
                        </Link>
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

export default EventCard
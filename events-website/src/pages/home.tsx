import React, { useState, useEffect } from 'react';
import supabase from "../utils/supabase"; // Supabase client import for your project
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination';
import EventCard from '../components/EventCard';
import Loading from '../components/SpinnerLoader'; // Import your loading component



// Responsive events per page based on screen size
const getEventsPerPage = () => {
  if (typeof window === 'undefined') return 12; // Default for SSR
  
  const width = window.innerWidth;
  if (width < 576) return 4;    // Extra Small screens: 4 events
  if (width < 768) return 6;    // Small tablets: 6 events
  if (width < 992) return 8;     // Medium tablets: 8 events
  if (width < 1200) return 9;    // Desktop: 9 events
  return 12;                     // Large desktop: 12 events
};

export default function Home() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [eventsPerPage, setEventsPerPage] = useState(getEventsPerPage());
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const totalPages = Math.ceil(totalEvents / eventsPerPage);


  // Effect to handle window resize for updating events per page
  useEffect(() => {
    const handleResize = () => {
      const newEventsPerPage = getEventsPerPage();
      if (newEventsPerPage !== eventsPerPage) {
        setEventsPerPage(newEventsPerPage);
        setCurrentPage(0); // Reset to first page
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [eventsPerPage]);

    const getMinWidth = () => {
    if (typeof window === "undefined") return "320px";
    const width = window.innerWidth;
    if (width < 576) return "100%";
    if (width < 768) return "540px";
    if (width < 992) return "720px";
    if (width < 1200) return "960px";
    return "1140px";
  };
    const [containerMinWidth, setContainerMinWidth] = useState(getMinWidth());

  useEffect(() => {
    const handleResize = () => setContainerMinWidth(getMinWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const getMinHeight = () => {
  if (typeof window === "undefined") return "600px";
  const width = window.innerWidth;
  // Estimate: card height (260px) + gutter (24px) * rows
  if (width < 576) return `${1 * 284}px`;   // 1 row
  if (width < 768) return `${3 * 284}px`;   // 3 rows
  if (width < 992) return `${3 * 284}px`;   // 3 rows
  if (width < 1200) return `${3 * 284}px`;  // 3 rows
  return `${3 * 284}px`;                    // 3 rows for large screens
};

const [containerMinHeight, setContainerMinHeight] = useState(getMinHeight());

useEffect(() => {
  const handleResize = () => setContainerMinHeight(getMinHeight());
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // Fetch unique cities for the dropdown filter
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('Events')
          .select('event_location')
          .not('event_location', 'is', null)
          .order('event_location');
        
        if (error) {
          console.error('Error fetching cities:', error);
          return;
        }
        
        if (data) {
          const uniqueCities = Array.from(new Set(data.map(item => item.event_location).filter(Boolean)));
          setCities(uniqueCities);
        }
      } catch (err) {
        console.error('Exception while fetching cities:', err);
      }
    };
    fetchCities();
  }, []);

  // Main effect to fetch events whenever filters or page change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      
      const startRange = currentPage * eventsPerPage;
      const endRange = startRange + eventsPerPage - 1;

      // Base query
      let query = supabase.from('Events').select('*', { count: 'exact' });

      // Apply search term filter
      if (searchTerm.trim()) {
        query = query.ilike('event_name', `%${searchTerm}%`);
      }
      
      // Apply city filter
      if (selectedCity) {
        query = query.eq('event_location', selectedCity);
      }

      // Add ordering and pagination
      const { data, error, count } = await query
        .order('event_name', { ascending: true })
        .range(startRange, endRange);

      if (error) {
        setFetchError('Could not fetch events');
        setEvents(null);
        console.error(error);
      } else if (data) {
        setEvents(data);
        setFetchError(null);
        if (count !== null) {
          setTotalEvents(count);
        }
      }
      
      setLoading(false);
    };

    fetchEvents();
  }, [currentPage, searchTerm, selectedCity, eventsPerPage]);

  // Reset to the first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCity]);


  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
  };

  // Generate pagination items for display
  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;
    let items = [];
    
    // Always visible: First and Previous
    items.push(<Pagination.First key="first" onClick={() => goToPage(0)} disabled={currentPage === 0} />);
    items.push(<Pagination.Prev key="prev" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} />);

    // Page numbers with ellipsis logic
    const pageRange = 2;
    let startPage = Math.max(0, currentPage - pageRange);
    let endPage = Math.min(totalPages - 1, currentPage + pageRange);

    if (currentPage - pageRange > 0) {
        items.push(<Pagination.Item key={0} onClick={() => goToPage(0)}>{1}</Pagination.Item>);
        if (currentPage - pageRange > 1) {
            items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
        }
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => goToPage(number)}>
          {number + 1}
        </Pagination.Item>
      );
    }

    if (currentPage + pageRange < totalPages - 1) {
        if (currentPage + pageRange < totalPages - 2) {
            items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
        }
        items.push(<Pagination.Item key={totalPages - 1} onClick={() => goToPage(totalPages - 1)}>{totalPages}</Pagination.Item>);
    }
    
    // Always visible: Next and Last
    items.push(<Pagination.Next key="next" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1} />);
    items.push(<Pagination.Last key="last" onClick={() => goToPage(totalPages - 1)} disabled={currentPage === totalPages - 1} />);

    return items;
  };
      useEffect(() => {
  
          setTimeout(() => setPageLoading(false), 330)
      }, [])
      if (pageLoading) {
          return <Loading/>
      }

  return (
    <Container className="p-3 p-md-4 bg-transparent"
    style={{ width: containerMinWidth, height: containerMinHeight, backgroundColor: 'transparent'}} >
      {/* Search and Filter Bar */}
      <Row className="mb-4 justify-content-center align-items-center g-2">
        <Col xs={12} sm={12} md>
          <div className="position-relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control"
              style={searchTerm ? { paddingRight: '2.5rem' } : {}}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary"
                style={{ fontSize: '1.2rem', padding: '0 0.75rem' }}
                aria-label="Clear search"
              >
              </button>
            )}
          </div>
        </Col>
        
        <Col xs={12} sm={7} md={4}>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="form-select"
            aria-label="Filter by city"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Col>
        
        {(searchTerm || selectedCity) && (
          <Col xs={12} sm={5} md="auto">
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary w-100"
            >
              Clear Filters
            </button>
          </Col>
        )}
      </Row>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading events...</p>
        </div>
      )}
      
      {fetchError && !loading && (
        <div className="alert alert-danger text-center">{fetchError}</div>
      )}
      
      {/* Events Grid and Pagination */}
      {!loading && !fetchError && events && (
        <>
          {events.length > 0 ? (
<Row className="g-3 align-items-stretch">
  {events.map((eventlisting: any) => (
    <Col 
      key={eventlisting.event_id} 
      xs={12} 
      sm={6} 
      md={4} 
      lg={3}
    >
      <EventCard eventlisting={eventlisting} />
    </Col>
  ))}
 
  
</Row>
          ) : (
            <div className="text-center py-5 text-muted">
                No events found. Try adjusting your search or filters.
            </div>
          )}
          
          <div className="d-flex flex-column align-items-center mt-4" >
            {totalPages > 1 && (
                <Pagination className='my-pagination'>{renderPaginationItems()}</Pagination>
            )}
            <div className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
              Showing page {currentPage + 1} of {totalPages} ({totalEvents} events found)
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
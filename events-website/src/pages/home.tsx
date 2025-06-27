import EventCard from '../components/EventCard'
import { useState, useEffect } from 'react';
import supabase from "../utils/supabase"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination';

// Responsive events per page based on screen size
const getEventsPerPage = () => {
  if (typeof window === 'undefined') return 12; // Default for SSR
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (height < 668) return 2;    // Mobile: 2 events
  if (height < 768) return 4;    // Small tablets: 4 events
  if (width < 992) return 6;     // Medium tablets: 6 events
  if (width < 1200) return 8;    // Desktop: 8 events
  return 12;                     // Large desktop: 12 events
};

export default function Home() {
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [events, setEvents] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalEvents, setTotalEvents] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [eventsPerPage, setEventsPerPage] = useState(getEventsPerPage())

  const totalPages = Math.ceil(totalEvents / eventsPerPage)

  // Handle window resize to update events per page
  useEffect(() => {
    const handleResize = () => {
      const newEventsPerPage = getEventsPerPage();
      if (newEventsPerPage !== eventsPerPage) {
        setEventsPerPage(newEventsPerPage);
        // Reset to first page when changing page size to avoid empty pages
        setCurrentPage(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [eventsPerPage]);

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [currentPage, searchTerm, selectedCity, eventsPerPage])

  useEffect(() => {
    // Reset to first page when search term or city filter changes
    if (searchTerm || selectedCity) {
      setCurrentPage(0)
    }
  }, [searchTerm, selectedCity])

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('Events')
        .select('event_location')
        .not('event_location', 'is', null)
        .order('event_location')
      
      if (error) {
        console.log('Error fetching cities:', error)
        return
      }
      
      if (data) {
        // Get unique cities
        const uniqueCities = Array.from(new Set(data.map(item => item.event_location).filter(Boolean)))
        setCities(uniqueCities)
      }
    } catch (error) {
      console.log('Error fetching cities:', error)
    }
  }

  const fetchEvents = async () => {
    setLoading(true)
    
    // Build the query with optional search filter, city filter, and alphabetical ordering
    let query = supabase.from('Events').select('*', { count: 'exact' })
    
    if (searchTerm.trim()) {
      query = query.ilike('event_name', `%${searchTerm}%`)
    }
    
    if (selectedCity) {
      query = query.eq('event_location', selectedCity)
    }
    
    // Get total count for pagination
    const { count } = await query
    
    if (count !== null) {
      setTotalEvents(count)
    }

    // Fetch events for current page with search filter, city filter, and alphabetical ordering
    const startRange = currentPage * eventsPerPage
    const endRange = startRange + eventsPerPage - 1

    let dataQuery = supabase.from('Events').select('*')
    
    if (searchTerm.trim()) {
      dataQuery = dataQuery.ilike('event_name', `%${searchTerm}%`)
    }
    
    if (selectedCity) {
      dataQuery = dataQuery.eq('event_location', selectedCity)
    }
    
    const { data, error } = await dataQuery
      .order('event_name', { ascending: true })
      .range(startRange, endRange)

    if (error) {
      setFetchError('Could not fetch events')
      setEvents(null)
      console.log(error)
    }
    if (data) {
      setEvents(data)
      setFetchError(null)
    }
    
    setLoading(false)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCity('')
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    let items = [];
    
    // Add "First" button if not on first page
    if (currentPage > 0) {
      items.push(
        <Pagination.First key="first" onClick={() => goToPage(0)} href="#" />
      );
    }
    
    // Add "Previous" button if not on first page
    if (currentPage > 0) {
      items.push(
        <Pagination.Prev key="prev" onClick={() => goToPage(currentPage - 1)} href="#" />
      );
    }

    // Calculate which page numbers to show
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    // Add ellipsis at the beginning if needed
    if (startPage > 0) {
      items.push(<Pagination.Item key={0} onClick={() => goToPage(0)} href="#">1</Pagination.Item>);
      if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Add page numbers
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => goToPage(number)}
          href="#"
        >
          {number + 1}
        </Pagination.Item>
      );
    }

    // Add ellipsis at the end if needed
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item key={totalPages - 1} onClick={() => goToPage(totalPages - 1)} href="#">
          {totalPages}
        </Pagination.Item>
      );
    }

    // Add "Next" button if not on last page
    if (currentPage < totalPages - 1) {
      items.push(
        <Pagination.Next key="next" onClick={() => goToPage(currentPage + 1)} href="#" />
      );
    }
    
    // Add "Last" button if not on last page
    if (currentPage < totalPages - 1) {
      items.push(
        <Pagination.Last key="last" onClick={() => goToPage(totalPages - 1)} href="#" />
      );
    }

    return items;
  };

  return (
    <Container fluid style={styles.container}>
      {/* Search and Filter Bar */}
      <Row className="mb-4 justify-content-center align-items-end" style={styles.filtersContainer}>
        <Col xs={12} sm={6} md={4} className="mb-2">
          <div style={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={styles.clearButton}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </Col>
        
        <Col xs={12} sm={6} md={4} className="mb-2">
          <select
            value={selectedCity}
            onChange={handleCityChange}
            style={styles.citySelect}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city} title={city}>
                {city.length > 20 ? `${city.substring(0, 20)}...` : city}
              </option>
            ))}
          </select>
        </Col>
        
        {(searchTerm || selectedCity) && (
          <Col xs={12} sm={12} md={2} className="mb-2">
            <button
              onClick={clearFilters}
              style={styles.clearFiltersButton}
              title="Clear all filters"
            >
              Clear All
            </button>
          </Col>
        )}
      </Row>

      {fetchError && (
        <Row>
          <Col>
            <div className="alert alert-danger text-center">{fetchError}</div>
          </Col>
        </Row>
      )}
      
      {loading && (
        <Row>
          <Col>
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading events...</span>
              </div>
              <p className="mt-2">Loading events...</p>
            </div>
          </Col>
        </Row>
      )}
      
      {events && (
        <div className='events'>
          {/* Events Grid with consistent card sizing */}
          <Row className="justify-content-center g-3" style={styles.eventsRow}>
            {events.map((eventlisting: any) => (
              <Col 
                key={eventlisting.event_id} 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                xl={3}
                className="d-flex"
                style={styles.cardColumn}
              >
                <EventCard eventlisting={eventlisting} />
              </Col>
            ))}
          </Row>
          
          {/* React Bootstrap Pagination */}
          {totalPages > 1 && (
            <Row>
              <Col>
                <div style={styles.paginationContainer}>
                  <Pagination>
                    {renderPaginationItems()}
                  </Pagination>
                </div>
              </Col>
            </Row>
          )}
          
          {/* Page Info */}
          <Row>
            <Col>
              <div style={styles.pageInfo}>
                {searchTerm || selectedCity ? (
                  <>
                    Page {currentPage + 1} of {totalPages} ( {totalEvents} events found
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCity && ` in ${selectedCity}`} )
                    {` • ${eventsPerPage} per page`}
                  </>
                ) : (
                  <>Page {currentPage + 1} of {totalPages} ({totalEvents} total events • {eventsPerPage} per page)</>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    padding: '20px',
  },
  filtersContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  eventsRow: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  cardColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    minHeight: 'fit-content',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '30px 0',
    width: '100%',
  },
  pageInfo: {
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#666',
    marginTop: '10px',
    marginBottom: '20px',
  },
  searchInputWrapper: {
    position: 'relative' as const,
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease',
  },
  clearButton: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
  citySelect: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  clearFiltersButton: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#666',
    whiteSpace: 'normal' as const,
    wordWrap: 'break-word' as const,
    textAlign: 'center' as const,
    lineHeight: '1.2',
    transition: 'all 0.2s ease',
    minHeight: '44px', // Ensures consistent height with other inputs
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
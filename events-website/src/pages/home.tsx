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
  const height = window.innerHeight
  if (height < 668) return 2;    // Mobile: 6 events
  if (height < 768) return 4;    // Small tablets: 8 events
  if (width < 992) return 6;   // Medium tablets: 12 events
  if (width < 1200) return 8;  // Desktop: 16 events
  return 12;                    // Large desktop: 20 events
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
    <Container>
      <div style={styles.pageInfo}>
        {/* Search and Filter Bar */}
        <Row>
          <Col>
            <input
              type="text"
              placeholder="Search events by name..."
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
          </Col>
          
          <Col>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              style={styles.citySelect}
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
            <button
              onClick={clearFilters}
              style={styles.clearFiltersButton}
              title="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </Row>

        {fetchError && (<p>{fetchError}</p>)}
        {loading && (<p>Loading events...</p>)}
        {events && (
          <div className='events'>
            {/* Properly wrapped cards in Row component for centering */}
            <Row className="justify-content-center">
              {events.map((eventlisting: any) => (
                <Col key={eventlisting.event_id} xs={12} sm={6} md={4} lg={3} xl={3} className="mb-4 d-flex justify-content-center">
                  <EventCard eventlisting={eventlisting} />
                </Col>
              ))}
            </Row>
            
            {/* React Bootstrap Pagination */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <Pagination>
                  {renderPaginationItems()}
                </Pagination>
              </div>
            )}
            
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
          </div>
        )}
      </div>
    </Container>
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
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  width: '100%',
},
// eventsGrid: {
//   display: 'grid',
//   gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//   gap: '20px',
//   width: '100%',
//   maxWidth: '1200px',
//   margin: '20px auto',
//   padding: '0 20px',
//   boxSizing: 'border-box' as const,
  
//   // Responsive breakpoints
//   '@media (max-width: 768px)': {
//     gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
//     gap: '15px',
//     padding: '0 15px',
//   },
  
//   '@media (max-width: 480px)': {
//     gridTemplateColumns: '1fr',
//     gap: '10px',
//     padding: '0 10px',
//   },
// },
paginationContainer: {
  display: 'flex',
  justifyContent: 'center',
  margin: '20px 0',
  width: '100%',
},
pageInfo: {
  textAlign: 'center' as const,
  fontSize: '14px',
  color: '#666',
  marginTop: '10px',
},
filtersContainer: {
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  flexWrap: 'wrap' as const,
  width: '100%',
  padding: '0 16px',
  boxSizing: 'border-box' as const,
},
  searchContainer: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  searchInputWrapper: {
    position: 'relative' as const,
    width: '300px',
    maxWidth: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box' as const,
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
  },
  cityFilterWrapper: {
    width: '200px',
    maxWidth: '100%',
  },
  citySelect: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
  },
  clearFiltersButton: {
    padding: '12px 20px',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#666',
    whiteSpace: 'nowrap' as const,
  }
};
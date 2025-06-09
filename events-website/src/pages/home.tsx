import EventCard from '../components/EventCard'
import { useState, useEffect } from 'react';
import supabase from "../utils/supabase"

const EVENTS_PER_PAGE = 10;

export default function Home() {
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [events, setEvents] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalEvents, setTotalEvents] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<string[]>([])

  const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE)

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [currentPage, searchTerm, selectedCity])

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
    const startRange = currentPage * EVENTS_PER_PAGE
    const endRange = startRange + EVENTS_PER_PAGE - 1

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

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
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

  return (
    <div style={styles.container}>
      <div>
        {/* Search and Filter Bar */}
        <div style={styles.filtersContainer}>
          <div style={styles.searchInputWrapper}>
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
          </div>
          
          <div style={styles.cityFilterWrapper}>
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
          </div>
          
          {(searchTerm || selectedCity) && (
            <button
              onClick={clearFilters}
              style={styles.clearFiltersButton}
              title="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        {fetchError && (<p>{fetchError}</p>)}
        {loading && (<p>Loading events...</p>)}
        {events && (
          <div className='events'>
            <div style={styles.eventsGrid}>
              {events.map((eventlisting: any) => (
                <EventCard key={eventlisting.event_id} eventlisting={eventlisting} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            <div style={styles.pagination}>
              <button 
                onClick={goToPrevPage} 
                disabled={currentPage === 0}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === 0 ? styles.disabledButton : {})
                }}
              >
                Previous
              </button>
              
              <div style={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === index ? styles.activePageButton : {})
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={goToNextPage} 
                disabled={currentPage >= totalPages - 1}
                style={{
                  ...styles.pageButton,
                  ...(currentPage >= totalPages - 1 ? styles.disabledButton : {})
                }}
              >
                Next
              </button>
            </div>
            
            <div style={styles.pageInfo}>
              {searchTerm || selectedCity ? (
                <>
                  Page {currentPage + 1} of {totalPages} ({totalEvents} events found
                  {searchTerm && ` for "${searchTerm}"`}
                  {selectedCity && ` in ${selectedCity}`})
                </>
              ) : (
                <>Page {currentPage + 1} of {totalPages} ({totalEvents} total events)</>
              )}
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
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  width: '100%',
  // overflowX: 'hidden' as const,
},
eventsGrid: {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '20px',
  width: '100%',
  maxWidth: '600px',
  margin: '0',
  boxSizing: 'border-box' as const,
  
},
pagination: {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  width: '90%',
  boxSizing: 'border-box' as const,
},
  pageNumbers: {
    display: 'flex-wrap',
    gap: '5px',
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
  },
  activePageButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderColor: '#007bff',
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    cursor: 'not-allowed',
    border: '1px solid #dee2e6',
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
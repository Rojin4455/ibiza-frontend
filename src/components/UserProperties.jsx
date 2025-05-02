import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Send, ChevronDown, Check, MapPin, Bed, Bath } from 'lucide-react';
import axiosInstance from '../axios/axiosInstance';
import UserPropertyCard from './UserPropertyCard';
import {
  setProperties,
  addMoreProperties,
  clearProperties,
  setLoading,
} from '../slices/propertySlice';
import EmailSender from './EmailSender';
import { useParams } from 'react-router-dom';
import UserDetails from './Settings/UserDetails';

function UserProperties({ user }) {

  const dispatch = useDispatch();
  const { properties, totalCount, next, loading, noSelect } = useSelector(state => state.properties);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectOpen, setSelectOpen] = useState(null);
  const queryParams = new URLSearchParams(window.location.search);
  const selection = queryParams.get("selection") ?? "false";
  const isSelection = selection === "True"; // this will be `true` if selection is 'true', otherwise false\
  const [previousSelect, setPreviousSelect] = useState([])

  useEffect(() => {
    const selected = properties
    .filter(prop => user.properties.includes(prop.id))
    .map(prop => prop.id)
    setSelectedProperties(selected)
    
  },[properties, user])

  const observer = useRef();
  const lastPropertyElementRef = useCallback(node => {
    if (loading || !next) return;
  
    if (observer.current) observer.current.disconnect();
  
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && next) {
        fetchProperties(next);
      }
    });
  
    if (node) observer.current.observe(node);
  }, [loading, next]);




  const buildQueryParams = (userObj) => {
    const params = new URLSearchParams();

    if (userObj?.min_price) params.append('price_min', userObj.min_price);
    if (userObj?.max_price) params.append('price_max', userObj.max_price);
    if (userObj?.property_type && userObj.property_type.toLowerCase() !== 'all') {
        params.append('property_type', userObj.property_type.toLowerCase());
      }
      
      if (userObj?.price_freq && userObj.price_freq.toLowerCase() !== 'all') {
        params.append('price_freq', userObj.price_freq.toLowerCase());
      }
      
    if (userObj?.beds && userObj.beds !== 'all') params.append('beds', userObj.beds);
    if (userObj?.baths && userObj.baths !== 'all') params.append('baths', userObj.baths);
    if (searchTerm) params.append('search', searchTerm);

    return params;
  };

  // Fetch properties function
  const fetchProperties = async (url = null, reset = false) => {
    if (loading) return;
    dispatch(setLoading(true));
  
    try {
        if (isSelection){
            url = `accounts/contacts/${user.id}?selection=true`;
        }
      const params = user ? buildQueryParams(user) : new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const requestUrl = url ? url : `accounts/properties/?${params.toString()}`;
      const response = await axiosInstance.get(requestUrl);
      const data = response.data;

      if (reset) {
        dispatch(setProperties(data));
        // Reset selected properties when fetching new list
        setSelectedProperties([]);
      } else {
        dispatch(addMoreProperties(data));
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearProperties());
      fetchProperties(null, true);
    }, 500);
  
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && next && !loading) {
      fetchProperties(next);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [next, loading]);

  // Handle property selection
  const togglePropertySelection = (propertyId) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };


  // Select all properties
  const selectAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(prop => prop.id));
    }
  };

  return (
    <div className="flex flex-col h-ful p-4">
      <h2 className="text-xl font-bold mb-4">Properties for {user?.first_name || 'Selected User'}</h2>
      
      
        {!noSelect && !loading &&(
      <EmailSender selectedProperties={selectedProperties} userId={user.id}/>
    )}
      
      {!isSelection && (
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Property List</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Showing {properties.length} of {totalCount || 0} properties</span>
          <button
            onClick={selectAllProperties}
            className="text-sm text-primary hover:text-primaryhover"
          >
            {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden flex-grow">
        <div className="overflow-y-auto h-full">
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {properties.map((property, index) => {
                const isLastElement = index === properties.length - 1;
                return (
                  <UserPropertyCard
                    key={`${property.id}-${index}`}
                    property={property}
                    togglePropertySelection={togglePropertySelection}
                    selectedProperties={selectedProperties}
                    lastPropertyElementRef={isLastElement ? lastPropertyElementRef : null}
                    noSelect={noSelect}
                    user={user}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mb-4"></div>
                  <p>Loading properties...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <p>No properties found</p>
                </div>
              )}
            </div>
          )}
          {loading && properties.length > 0 && (
            <div className="p-4 text-center text-gray-500">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-2"></div>
              <p>Loading more properties...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProperties;
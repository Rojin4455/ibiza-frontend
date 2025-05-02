import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, MapPin, Bed, Bath, DollarSign, X, Check } from 'lucide-react';
import axiosInstance from '../axios/axiosInstance';

const SearchAndFilter = ({ onFilterChange, onSearch, accessLevel, currentLocationId }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [inputVal, setInputVal] = useState('');


  const locationRef = useRef(null);
  
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 200000000,
    type: 'all',
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    locations: []
  });

  console.log("filtersSS: ", filters)


  const [filterOptions, setFilterOptions] = useState({
    priceMin: 0,
    priceMax: 3000000,
    property_types: [],
    price_freqs: [],
    locations: [],
    xml_urls: []
  });

  console.log("filtersss: ", filterOptions)

  // const handleSubmitFilter = async () => {
  //   try {
  //     const params = new URLSearchParams();
  
  //     // Append filters to query params
  //     if (filters.priceMin) params.append('price_min', filters.priceMin);
  //     if (filters.priceMax) params.append('price_max', filters.priceMax);
  //     if (filters.propertyType && filters.propertyType !== 'all') params.append('property_type', filters.propertyType);
  //     if (filters.type && filters.type !== 'all') params.append('price_freq', filters.type);
  //     if (filters.bedrooms && filters.bedrooms !== 'all') params.append('beds', filters.bedrooms);
  //     if (filters.bathrooms && filters.bathrooms !== 'all') params.append('baths', filters.bathrooms);
  
  //     if (filters.locations && filters.locations.length > 0) {
  //       filters.locations.forEach(location => {
  //         params.append('town', location); // DjangoFilterBackend will read multiple `locations`
  //       });
  //     }
  
  //     const response = await axiosInstance.get(`accounts/properties/?${params.toString()}`);
  
  //     if (response.status === 200) {
  //       console.log("Success response:", response.data);
  //     } else {
  //       console.error("Error response:", response);
  //     }
  
  //   } catch (error) {
  //     console.error("Something went wrong:", error);
  //   }
  // };
  

  useEffect(() => {
    if (accessLevel === 'loading') return;
    console.log("herer")
    axiosInstance.get(`/accounts/api/filters/?accessLevel=${accessLevel}${currentLocationId ? `&locationId=${currentLocationId}` : ''}`)
      .then(response => {
        setFilterOptions({
          priceMin: response.data.min_price || 0,
          priceMax: response.data.max_price || 1000000,
          property_types: response.data.property_types || [],
          price_freqs: response.data.price_freqs || [],
          locations: response.data.locations || [],
          xml_urls: response.data.xml_urls || []
        });
      })
      .catch(error => console.error("Error fetching filters", error));
  }, [accessLevel]);

  // Close location dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // This was causing the infinite loop - we need to memoize the callback
  // or use a different approach than updating on every render
  const notifyFilterChange = () => {
    if (onFilterChange) {
      onFilterChange({ 
        ...filters, 
        location: selectedLocations 
      });
    }
  };

  // Only update parent when filters or selected locations actually change
  useEffect(() => {
    notifyFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), JSON.stringify(selectedLocations)]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      return { ...prev, [key]: value };
    });
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (inputVal.trim().length > 2 || inputVal.trim() === "") {
        onSearch(inputVal);  // Only call onSearch after 500ms
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce); // Clear timeout on change
  }, [inputVal]);

  const handleSearch = (e) => {
    setInputVal(e.target.value);
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  const removeLocation = (location) => {
    setSelectedLocations(prev => prev.filter(loc => loc !== location));
  };

  const clearAllLocations = () => {
    setSelectedLocations([]);
  };

  useEffect(() => {
    handleFilterChange('locations',selectedLocations)
  },[selectedLocations])

  const filteredLocations = filterOptions.locations
    .filter(location => 
      location.toLowerCase().includes(locationSearch.toLowerCase())
    );

  // For the price range slider
  const handlePriceMinChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 0 && (!filters.priceMax || value <= filters.priceMax)) {
      handleFilterChange('priceMin', value);
    }
  };

  const handlePriceMaxChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!value || (value >= filters.priceMin)) {
      handleFilterChange('priceMax', value || filterOptions.priceMax);
    }
  };
  
  return (
<div className="bg-white rounded-lg shadow-lg p-5 mb-8 border border-gray-100 sticky top-5 z-30">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Search Input */}
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-300 transition-colors"
        placeholder="Search properties by name, features..."
        onChange={handleSearch}
      />
    </div>

    {/* Filter Toggle Button */}
    <button
      className="flex items-center justify-center px-5 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      onClick={() => setShowFilters(!showFilters)}
    >
      <Filter className="h-5 w-5 mr-2 text-primary" />
      {showFilters ? 'Hide Filters' : 'Show Filters'}
      <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
    </button>
  </div>

  {/* Selected Locations */}
  {selectedLocations.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500 flex items-center">
        <MapPin size={14} className="mr-1" />
        Selected locations:
      </span>
      {selectedLocations.map(location => (
        <span
          key={location}
          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center"
        >
          {location}
          <button
            onClick={() => removeLocation(location)}
            className="ml-1 text-blue-800 hover:text-blue-900 focus:outline-none"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <button
        onClick={clearAllLocations}
        className="text-xs text-gray-500 hover:text-red-500 ml-2 underline focus:outline-none"
      >
        Clear all
      </button>
    </div>
  )}

  {/* Filters Section */}
  {showFilters && (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Each filter section remains unchanged */}
        {/* Price Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-primary" />
            Price Range
          </label>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={filters.priceMin}
                  onChange={handlePriceMinChange}
                />
              </div>
              <span className="text-gray-500">-</span>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={filters.priceMax}
                  onChange={handlePriceMaxChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Status */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Property Status</label>
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none bg-white"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              {filterOptions.price_freqs.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Property Type</label>
          <div className="relative">
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none bg-white"
            >
              <option value="all">All Property Types</option>
              {filterOptions.property_types.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Bed className="h-4 w-4 mr-1 text-primary" />
            Bedrooms
          </label>
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none bg-white"
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            >
              <option value="all">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Bathrooms */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Bath className="h-4 w-4 mr-1 text-primary" />
            Bathrooms
          </label>
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none bg-white"
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            >
              <option value="all">Any</option>
              <option value="1">1 Bathroom</option>
              <option value="2">2 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3" ref={locationRef}>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            Location
          </label>
          <div className="relative">
            <div
              className="flex items-center w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              <input
                type="text"
                placeholder={selectedLocations.length ? `${selectedLocations.length} selected` : "Search locations..."}
                className="block w-full text-sm focus:outline-none bg-transparent"
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  if (!showLocationDropdown) setShowLocationDropdown(true);
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={16} className={`transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {showLocationDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredLocations.length === 0 ? (
                  <div className="text-gray-500 px-4 py-2 text-sm">No locations found</div>
                ) : (
                  <>
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">{selectedLocations.length} selected</span>
                      {selectedLocations.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAllLocations();
                          }}
                          className="text-xs text-primary hover:text-primaryhover focus:outline-none"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {filteredLocations.map(location => (
                      <div
                        key={location}
                        className={`px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-blue-50 ${selectedLocations.includes(location) ? 'bg-blue-50' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationToggle(location);
                        }}
                      >
                        <span className="text-sm">{location}</span>
                        {selectedLocations.includes(location) && (
                          <Check size={16} className="text-blue-600" />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* XML Feed */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Property Type</label>
          <div className="relative">
            <select
              value={filters.xml_urls}
              onChange={(e) => handleFilterChange('xml_urls', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm appearance-none bg-white"
            >
              <option value="all">All Xml Feeds</option>
              {filterOptions.xml_urls.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-4">
        <button
          onClick={() => {
            setFilters({
              priceMin: 0,
              priceMax: 200000000,
              type: 'all',
              propertyType: 'all',
              bedrooms: 'all',
              bathrooms: 'all',
              location: [],
              xml_urls:[],
            });
            setSelectedLocations([]);
            setLocationSearch('');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition-colors duration-200"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default SearchAndFilter;
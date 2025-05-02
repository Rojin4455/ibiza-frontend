import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../axios/axiosInstance";
import PropertyCard from "./PropertyCard";
import SearchAndFilter from "./SearchAndFilter";
import {
  setProperties,
  addMoreProperties,
  clearProperties,
  setLoading,
} from "../slices/propertySlice";
import { useAccessControl } from "../customHooks/useAccessControl";
import { useSearchParams } from "react-router-dom";

const PropertyList = () => {
  const dispatch = useDispatch();
  const { accessLevel,locationId } = useAccessControl();
  const [searchParams] = useSearchParams();

  const currentLocationId = locationId || searchParams.get('locationId');


  const { properties, totalCount, next, loading } = useSelector(state => state.properties);
  
  const [filters, setFilters] = useState(null);

  const buildQueryParams = (filtersObj) => {
    const params = new URLSearchParams();

    if (filtersObj?.priceMin) params.append('price_min', filtersObj.priceMin);
    if (filtersObj?.priceMax) params.append('price_max', filtersObj.priceMax);
    if (filtersObj?.propertyType && filtersObj.propertyType !== 'all') params.append('property_type', filtersObj.propertyType);
    if (filtersObj?.type && filtersObj.type !== 'all') params.append('price_freq', filtersObj.type);
    if (filtersObj?.bedrooms && filtersObj.bedrooms !== 'all') params.append('beds', filtersObj.bedrooms);
    if (filtersObj?.bathrooms && filtersObj.bathrooms !== 'all') params.append('baths', filtersObj.bathrooms);
    if (filtersObj?.xml_urls && filtersObj.xml_urls !== 'all') params.append('xml_urls', filtersObj.xml_urls);

    if (filtersObj?.locations?.length > 0) {
      filtersObj.locations.forEach(location => {
        params.append('town', location);
      });
    }

    return params;
  };

  const fetchProperties = async (url = null, filtersToUse = null, reset = false) => {
    if (loading || accessLevel === 'loading') return;
    dispatch(setLoading(true));
    try {
      const params = filtersToUse ? buildQueryParams(filtersToUse) : null;
      const requestUrl = url ? url : `accounts/properties/?${params?.toString() || ''}&accessLevel=${accessLevel}${currentLocationId ? `&locationId=${currentLocationId}` : ''}`;

      const response = await axiosInstance.get(requestUrl);
      const data = response.data;

      if (reset) {
        dispatch(setProperties(data));
      } else {
        dispatch(addMoreProperties(data));
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };
  useEffect(() => {
    fetchProperties(null, filters, true);
  }, [filters]);
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && next && !loading) {
      fetchProperties(next, filters);
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const handleFilterChange = (newFilters) => {
    dispatch(clearProperties());
    setFilters(newFilters);
  };

  const onSearch = async (searchVal, reset = true) => {
    console.log("search val: ", searchVal)
    if (!searchVal || searchVal.trim() === "") {
        setFilters(null)
        return
      }

    if (loading) return;
    dispatch(setLoading(true));
    try {
      
    const requestUrl = `accounts/fetch-properties/?search=${[searchVal]}&accessLevel=${accessLevel}${currentLocationId ? `&locationId=${currentLocationId}` : ''}`;
      const response = await axiosInstance.get(requestUrl);
      const data = response.data;

      if (reset) {
        console.log("data: ", data)
        dispatch(setProperties(data));
      } else {
        dispatch(addMoreProperties(data));
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Properties</h2>
        <div className="text-gray-600">Showing {properties.length} of {totalCount} properties</div>
      </div>

      <SearchAndFilter onFilterChange={handleFilterChange} onSearch={onSearch} accessLevel={accessLevel} currentLocationId={currentLocationId}/>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, index) => (
          <PropertyCard key={`${property.id}-${index}`} property={property} />
        ))}
      </div>

      {loading && (
        <div className="text-center mt-4 text-gray-500">Loading more properties...</div>
      )}
    </div>
  );
};

export default PropertyList;

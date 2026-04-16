import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../axios/axiosInstance';
import UserPropertyCard from './UserPropertyCard';
import {
  setProperties,
  addMoreProperties,
  clearProperties,
  setLoading,
} from '../slices/propertySlice';
import EmailSender from './EmailSender';
import { useSearchParams } from 'react-router-dom';
import { useAccessControl } from '../customHooks/useAccessControl';

const ALL_SENTINEL = 'all';

function hasMeaningfulFilterValue(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'number') return !Number.isNaN(val);
  const s = String(val).trim();
  if (!s) return false;
  return s.toLowerCase() !== ALL_SENTINEL;
}

/** Maps UI labels to API values (backend allows land, villa, appartment, finca). */
function mapPropertyTypeForApi(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const normalized = raw.trim().toLowerCase();
  const fixed = normalized === 'apartment' ? 'appartment' : normalized;
  const allowed = new Set(['land', 'villa', 'appartment', 'finca']);
  return allowed.has(fixed) ? fixed : null;
}

function firstMatchingPropertyType(propertyTypeField) {
  if (!propertyTypeField || typeof propertyTypeField !== 'string') return null;
  for (const part of propertyTypeField.split(',')) {
    const apiType = mapPropertyTypeForApi(part);
    if (apiType) return apiType;
  }
  return null;
}

function tagTokensFromContact(contact) {
  const tags = contact?.tags;
  if (!Array.isArray(tags)) return new Set();
  const out = new Set();
  for (const raw of tags) {
    const s = String(raw).toLowerCase().trim();
    if (!s) continue;
    out.add(s);
    for (const part of s.split(/[\s/_]+/)) {
      const p = part.trim();
      if (p) out.add(p);
    }
  }
  return out;
}

/**
 * When price_freq is empty, derive sale/rental from GHL tags + property_status
 * (matches backend get_filtered_properties_for_contact / price_freq_modes).
 */
function getPriceFreqModesFromContact(contact) {
  if (!contact) return null;
  if (hasMeaningfulFilterValue(contact.price_freq)) return null;
  const tokens = tagTokensFromContact(contact);
  let sale = tokens.has('sale');
  let rental = tokens.has('rental');
  const ps = String(contact.property_status || '').trim().toLowerCase();
  if (ps === 'sale') sale = true;
  if (ps === 'rental') rental = true;
  if (sale && rental) return 'sale,rental';
  if (sale) return 'sale';
  if (rental) return 'rental';
  return null;
}

/** Query params for accounts/properties/ from contact filter fields (only set values). */
export function buildContactPropertyQueryParams(contact, searchTerm) {
  const params = new URLSearchParams();
  if (!contact) return params;

  if (hasMeaningfulFilterValue(contact.min_price)) {
    params.append('price_min', String(contact.min_price).trim());
  }
  if (hasMeaningfulFilterValue(contact.max_price)) {
    params.append('price_max', String(contact.max_price).trim());
  }
  if (hasMeaningfulFilterValue(contact.price_freq)) {
    params.append('price_freq', String(contact.price_freq).trim().toLowerCase());
  } else {
    const modes = getPriceFreqModesFromContact(contact);
    if (modes) params.append('price_freq_modes', modes);
  }

  if (contact.beds != null && hasMeaningfulFilterValue(contact.beds)) {
    params.append('beds', String(contact.beds).trim());
  }
  if (contact.baths != null && hasMeaningfulFilterValue(contact.baths)) {
    params.append('baths', String(contact.baths).trim());
  }

  const locationText = [contact.province, contact.preferred_location].find(hasMeaningfulFilterValue);
  if (locationText) {
    params.append('province', String(locationText).trim());
  }

  const propertyType = firstMatchingPropertyType(contact.property_type);
  if (propertyType) {
    params.append('property_type', propertyType);
  }

  if (searchTerm && String(searchTerm).trim()) {
    params.append('search', String(searchTerm).trim());
  }

  return params;
}

function ContactTagsAndFilterSummary({ user }) {
  if (!user) return null;
  const modes = getPriceFreqModesFromContact(user);
  const tokens = tagTokensFromContact(user);
  const showSale = tokens.has('sale') || String(user.property_status || '').toLowerCase() === 'sale';
  const showRental = tokens.has('rental') || String(user.property_status || '').toLowerCase() === 'rental';
  const hasListingBadges = showSale || showRental;
  const tags = Array.isArray(user.tags) ? user.tags : [];

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">GHL tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.length > 0 ? (
              tags.map((t, i) => (
                <span
                  key={`${i}-${String(t)}`}
                  className="inline-flex max-w-full truncate rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-800 ring-1 ring-gray-200"
                  title={String(t)}
                >
                  {String(t)}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No tags on this contact</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">Listing filter</p>
          <div className="flex flex-wrap justify-end gap-1.5">
            {hasMeaningfulFilterValue(user.price_freq) ? (
              <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-900 ring-1 ring-violet-200">
                price_freq: {String(user.price_freq).trim()}
              </span>
            ) : null}
            {hasListingBadges ? (
              <>
                {showSale && (
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">
                    Sale
                  </span>
                )}
                {showRental && (
                  <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-900 ring-1 ring-sky-200">
                    Rental
                  </span>
                )}
              </>
            ) : null}
            {!hasMeaningfulFilterValue(user.price_freq) && !hasListingBadges && (
              <span className="text-xs text-gray-500">No sale/rental filter</span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-600 border-t border-gray-200/80 pt-3">
        <span className="font-medium text-gray-800">Properties below</span> use these preferences, including{' '}
        {hasMeaningfulFilterValue(user.price_freq) ? (
          <code className="rounded bg-white px-1 py-0.5 text-[11px] ring-1 ring-gray-200">price_freq</code>
        ) : modes ? (
          <code className="rounded bg-white px-1 py-0.5 text-[11px] ring-1 ring-gray-200">
            price_freq_modes={modes}
          </code>
        ) : (
          'no listing-type filter'
        )}
        {', '}
        plus price, location, beds/baths, and type when set.
      </p>
    </div>
  );
}

function isIdInList(propertyId, list) {
  if (propertyId == null || !list?.length) return false;
  const s = String(propertyId);
  return list.some((x) => String(x) === s);
}

function UserProperties({ user, onContactPatched }) {

  const dispatch = useDispatch();
  const { accessLevel, locationId: accessLocationId } = useAccessControl();
  const [searchParams] = useSearchParams();
  const { properties, totalCount, next, loading, noSelect } = useSelector(state => state.properties);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectOpen, setSelectOpen] = useState(null);
  const selection = (searchParams.get('selection') ?? 'false').toLowerCase();
  const isSelection = selection === 'true' || selection === '1' || selection === 'yes';
  const allSharedPropertyIds = Array.isArray(user?.properties) ? user.properties : []
  const lastSharedPropertyIds = Array.isArray(user?.last_shared_property_ids)
    ? user.last_shared_property_ids
    : []

  useEffect(() => {
    if (isSelection) return;
    setSelectedProperties((prev) => prev.filter((id) => !isIdInList(id, allSharedPropertyIds)));
  }, [isSelection, user?.properties]);

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




  // Fetch properties function
  const fetchProperties = async (url = null, reset = false) => {
    if (loading) return;
    const isPropertiesList = !url && !isSelection;
    if (isPropertiesList && accessLevel === 'loading') return;
    dispatch(setLoading(true));
  
    try {
        if (isSelection){
            url = `accounts/contacts/${user.id}?selection=true`;
        }
      const params = !url && user
        ? buildContactPropertyQueryParams(user, searchTerm)
        : new URLSearchParams();
      if (!url && searchTerm && String(searchTerm).trim()) {
        params.set('search', String(searchTerm).trim());
      }
      if (!url) {
        params.set('accessLevel', accessLevel || 'restricted');
        const loc =
          accessLocationId ||
          searchParams.get('locationId') ||
          user?.location_id;
        if (loc) params.set('locationId', loc);
      }
      const qs = params.toString();
      const requestUrl = url ? url : `accounts/properties/?${qs}`;
      const response = await axiosInstance.get(requestUrl);
      const data = response.data;

      if (reset) {
        dispatch(setProperties(data));
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

  const tagsDependencyKey = Array.isArray(user?.tags)
    ? [...user.tags].map(String).sort().join('\u0001')
    : '';

  const contactFilterFingerprint = [
    user?.min_price,
    user?.max_price,
    user?.beds,
    user?.baths,
    user?.province,
    user?.preferred_location,
    user?.property_type,
    user?.price_freq,
    user?.property_status,
    tagsDependencyKey,
  ].join('|');

  useEffect(() => {
    if (!user?.id) return undefined;
    if (!isSelection && accessLevel === 'loading') return undefined;
    const timer = setTimeout(() => {
      dispatch(clearProperties());
      fetchProperties(null, true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, accessLevel, user?.id, isSelection, contactFilterFingerprint]);

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
    if (!isSelection && isIdInList(propertyId, allSharedPropertyIds)) return;
    setSelectedProperties((prev) => {
      if (isIdInList(propertyId, prev)) {
        return prev.filter((id) => String(id) !== String(propertyId));
      }
      return [...prev, propertyId];
    });
  };


  // Select all properties
  const selectAllProperties = () => {
    const selectable = properties
      .filter((p) => !isIdInList(p.id, allSharedPropertyIds))
      .map((p) => p.id);
    if (selectable.length === 0) return;
    const allSelectablePicked =
      selectable.length > 0 && selectable.every((id) => isIdInList(id, selectedProperties));
    if (allSelectablePicked) {
      setSelectedProperties((prev) => prev.filter((id) => !isIdInList(id, selectable)));
    } else {
      setSelectedProperties((prev) => {
        const next = new Set(prev);
        selectable.forEach((id) => next.add(id));
        return [...next];
      });
    }
  };

  return (
    <div className="flex flex-col h-ful p-4">
      <h2 className="text-xl font-bold mb-4">Properties for {user?.first_name || 'Selected User'}</h2>

      {!isSelection && <ContactTagsAndFilterSummary user={user} />}

      {!isSelection && (
        <p className="text-xs text-gray-600 mb-3 rounded-md border border-emerald-100 bg-emerald-50/60 px-3 py-2">
          <span className="font-semibold text-emerald-900">Already sent</span> and{' '}
          <span className="font-semibold text-amber-900">Latest send</span> match the customer link. Listings already emailed have a{' '}
          <span className="font-medium">locked checkbox</span> — choose new ones for the next send.
        </p>
      )}

        {!noSelect && !loading &&(
      <EmailSender
        selectedProperties={selectedProperties}
        userId={user.id}
        onContactPatched={(patch) => {
          onContactPatched?.(patch)
          setSelectedProperties([])
        }}
      />
    )}
      
      {isSelection && (
        <p className="text-sm text-gray-600 mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <span className="font-medium text-gray-800">Latest email</span> highlights properties from the most recent send;{' '}
          <span className="font-medium text-sky-800">Earlier share</span> marks listings shared on a previous send. All of them stay on this page.
        </p>
      )}

      {!isSelection && (
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Property List</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Showing {properties.length} of {totalCount || 0} properties</span>
          <button
            type="button"
            onClick={selectAllProperties}
            className="text-sm text-primary hover:text-primaryhover"
          >
            {(() => {
              const selectable = properties.filter((p) => !isIdInList(p.id, allSharedPropertyIds));
              const allPicked =
                selectable.length > 0 &&
                selectable.every((id) => isIdInList(id, selectedProperties));
              return allPicked ? 'Deselect All' : 'Select All';
            })()}
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
                    isSelection={isSelection}
                    allSharedPropertyIds={allSharedPropertyIds}
                    lastSharedPropertyIds={lastSharedPropertyIds}
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
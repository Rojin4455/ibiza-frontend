import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UserProperties from '../components/UserProperties'
import UserProfileSummary from '../components/UserProfileSummary'
import axiosInstance from '../axios/axiosInstance'
import SearchAndFilter from '../components/SearchAndFilter'
import { useAccessControl } from '../customHooks/useAccessControl'
import { clearProperties } from '../slices/propertySlice'
import { useDispatch } from 'react-redux'

function UserDetailsPage({selection}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(null);
  const dispatch = useDispatch()


  const { accessLevel, locationId: accessLocationId } = useAccessControl();
  const locationId = accessLocationId || searchParams.get('locationId')

  const goBackToDashboard = () => {
    if (locationId) navigate(`/?locationId=${encodeURIComponent(locationId)}`)
    else navigate('/')
  }

  const onSearch = () => {

  }

  const onFilterChange = (newFilters) => {
    console.log("on gilter change: ", newFilters)
    // dispatch(clearProperties());
    setFilters(newFilters);
  }

  useEffect(() => {
    // fetchProperties(null, filters, true);
  }, [filters]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/accounts/contacts/${id}`)
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  // 🟡 Optionally, show a loader while data is being fetched
  if (loading) {
    return (
        <>
        
        {!selection && (
              <Header activeTab="dashboard" />
            )}
      <div className="flex items-center justify-center h-screen">

        <div className="text-lg font-semibold text-gray-500">Loading user details...</div>
      </div>
      
      </>
    )
  }

  // 🛑 If no user found, display an error
  if (!user) {
    return (
        <>
              <Header activeTab="dashboard" />
      <div className="flex items-center justify-center h-screen">

        <div className="text-lg font-semibold text-red-500">User not found.</div>
      </div>
      </>
    )
  }

  return (
    <>
    {!selection && (
      <Header activeTab="dashboard" />
    )}
      <div className="container mx-auto px-4 py-6">
        <button
          type="button"
          onClick={goBackToDashboard}
          className="mb-4 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to dashboard
        </button>
        <UserProfileSummary user={user} />
        {/* <SearchAndFilter onFilterChange={onFilterChange} onSearch={onSearch} accessLevel={accessLevel} currentLocationId={locationId}  /> */}
        <UserProperties
          user={user}
          onContactPatched={(patch) => setUser((u) => (u ? { ...u, ...patch } : u))}
        />
      </div>
    </>
  )
}

export default UserDetailsPage

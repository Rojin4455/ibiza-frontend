import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useParams, useSearchParams } from 'react-router-dom'
import UserProperties from '../components/UserProperties'
import UserProfileSummary from '../components/UserProfileSummary'
import axiosInstance from '../axios/axiosInstance'

function UserDetailsPage({selection}) {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


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
        <UserProfileSummary user={user} />
        <UserProperties user={user} />
      </div>
    </>
  )
}

export default UserDetailsPage

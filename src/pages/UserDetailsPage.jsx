import React from 'react'
import Header from '../components/Header'
import { User } from 'lucide-react'
import UserProperties from '../components/UserProperties'
import { useLocation } from 'react-router-dom';
import UserProfileSummary from '../components/UserProfileSummary';

function UserDetailsPage() {
    const location = useLocation();
    const { user } = location.state || {};
  return (
    
    <>
            <Header activeTab={'dashboard'}/>
            <div className="container mx-auto px-4 py-6">
            <UserProfileSummary user={user} />
            <UserProperties user={user}/>
            </div>

    </>
  )
}

export default UserDetailsPage
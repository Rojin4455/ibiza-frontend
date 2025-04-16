import React from 'react'
import PropertyList from '../components/PropertyList'
import Header from '../components/Header'

function UserPropertyPage() {
  return (
    <>
    <Header activeTab={'properties'}/>
    <PropertyList/>
    </>
  )
}

export default UserPropertyPage
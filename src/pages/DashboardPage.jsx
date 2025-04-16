import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PropertyList from '../components/PropertyList'
import Dashboard from '../components/Dashboard'



function DashboardPage() {
  return (
    <>
    {/* <Header/>
    <div>DashboardPage</div>
    <Footer/> */}
    <Header activeTab={'dashboard'}/>
    {/* <PropertyList/> */}
    <Dashboard/>
    </>
  )
}

export default DashboardPage
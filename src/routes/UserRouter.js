import React from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import UserPropertyPage from '../pages/UserPropertyPage'
import UserDetailsPage from '../pages/UserDetailsPage'
import SettingsPage from '../pages/SettingsPage'


function UserRouter() {
  return (
    <Routes>
        <Route path='/' element={<DashboardPage/>} />
        <Route path='/properties' element={<UserPropertyPage/>} />
        <Route path='/user-properties' element={<UserDetailsPage/>} />
        <Route path='/settings' element={<SettingsPage/>} />
        </Routes>  )
}

export default UserRouter
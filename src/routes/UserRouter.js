import React from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import UserPropertyPage from '../pages/UserPropertyPage'


function UserRouter() {
  return (
    <Routes>
        <Route path='/' element={<DashboardPage/>} />
        <Route path='/properties' element={<UserPropertyPage/>} />
        </Routes>  )
}

export default UserRouter
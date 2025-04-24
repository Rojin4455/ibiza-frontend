import React from 'react'
import { Route, Routes, useSearchParams } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import UserPropertyPage from '../pages/UserPropertyPage'
import UserDetailsPage from '../pages/UserDetailsPage'
import SettingsPage from '../pages/SettingsPage'
import AuthPages from '../pages/AuthUser'
import UserProtectedRouter from './UserProtectedRouter'


function UserRouter() {
  const [searchParams] = useSearchParams();
  const selection = searchParams.get('selection');
  return (
    <Routes>
        <Route path='/' element={<UserProtectedRouter><DashboardPage/></UserProtectedRouter>} />
        <Route path='/location/:id' element={<UserProtectedRouter><DashboardPage/></UserProtectedRouter>} />
        <Route path='/properties' element={<UserProtectedRouter><UserPropertyPage/></UserProtectedRouter>} />
        {selection === "True" ? (
        <Route path='/user-properties/:id' element={<UserDetailsPage selection={true}/>} />
      ) : (
        <Route path='/user-properties/:id' element={<UserProtectedRouter><UserDetailsPage selection={false}/></UserProtectedRouter>} />

      )}
        <Route path='/settings' element={<UserProtectedRouter><SettingsPage/></UserProtectedRouter>} />
        <Route path='/user' element={<AuthPages/>} />
        </Routes>  )
}

export default UserRouter
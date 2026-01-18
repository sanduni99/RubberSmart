// src/layouts/DashboardLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import AppSidebar from '../components/dashboard/AppSidebar'
import AppHeader from '../components/dashboard/AppHeader'
import { CContainer } from '@coreui/react'


const DashboardLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="dashboard-wrapper">
          <CContainer lg>
            <Outlet />
          </CContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
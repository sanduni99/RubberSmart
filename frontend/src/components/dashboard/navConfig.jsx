// src/components/dashboard/navConfig.js
import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilChart, cilDollar, cilList, cilSettings, cilUser } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const navConfig = [

  {
    component: CNavTitle,
    name: 'Admin',
  },

  {
    component: CNavItem,
    name: 'Admin Dashboard',
    to: '/admin/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
  component: CNavItem,
  name: 'Users',
  to: '/admin/users',
  icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
},

  {
    component: CNavItem,
    name: 'Prediction Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Analytics',
  },

  {
    component: CNavItem,
    name: 'Yield Prediction',
    to: '/dashboard/yield-prediction',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Price Intelligence',
    to: '/dashboard/price-intelligence',
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Account',
  },

  {
    component: CNavItem,
    name: 'Profile',
    to: '/dashboard/profile',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

]


export default navConfig

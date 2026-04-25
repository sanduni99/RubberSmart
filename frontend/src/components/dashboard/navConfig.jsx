
import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilChart, cilDollar, cilList, cilSettings, cilUser } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const navConfig = (user) => [
  ...(user?.role === "admin"
    ? [
        {
          component: CNavTitle,
          name: "Admin",
        },
        {
          component: CNavItem,
          name: "Admin Dashboard",
          to: "/admin/dashboard",
        },
        {
          component: CNavItem,
          name: "Users",
          to: "/admin/users",
        },
      ]
    : []),

  {
    component: CNavItem,
    name: "Prediction Dashboard",
    to: "/dashboard",
  },

  {
    component: CNavTitle,
    name: "Analytics",
  },

  {
    component: CNavItem,
    name: "Yield Prediction/අස්වැන්න අනාවැකි",
    to: "/dashboard/yield-prediction",
  },

  {
    component: CNavItem,
    name: "Price Intelligence/ මිල බුද්ධිය",
    to: "/dashboard/price-intelligence",
  },

  {
    component: CNavTitle,
    name: "Account",
  },

  {
    component: CNavItem,
    name: "Profile",
    to: "/dashboard/profile",
  },
];


export default navConfig

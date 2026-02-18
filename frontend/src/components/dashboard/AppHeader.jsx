import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavItem,
  CNavLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilEnvelopeOpen,
  cilMenu,
  cilAccountLogout,
  cilUser,
  cilSettings,
} from '@coreui/icons'

const AppHeader = () => {
  const dispatch = useDispatch()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-none d-md-flex me-auto">
          <CNavItem>
            <CNavLink onClick={() => navigate("/dashboard")}>
              Dashboard
            </CNavLink>
          </CNavItem>

          <CNavItem>
            <CNavLink onClick={() => navigate("/dashboard/yield-prediction")}>
              Yield
            </CNavLink>
          </CNavItem>

          <CNavItem>
            <CNavLink onClick={() => navigate("/dashboard/price-intelligence")}>
              Prices
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        <CHeaderNav>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        <CHeaderNav className="ms-3">
          <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
              <CAvatar color="primary" textColor="white" size="md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </CAvatar>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem header className="py-2 bg-light fw-semibold">
                {user?.name || 'User'}
              </CDropdownItem>
              <CDropdownItem onClick={() => navigate("/dashboard/profile")}>
                <CIcon icon={cilUser} className="me-2" />
                Profile
              </CDropdownItem>
              

              <CDropdownDivider />
              <CDropdownItem onClick={handleLogout}>
                <CIcon icon={cilAccountLogout} className="me-2" />
                Logout
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
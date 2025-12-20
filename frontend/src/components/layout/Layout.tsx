import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  MedicalServices,
  CalendarToday,
  LocalHospital,
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logoutAsync } from '../../store/slices/authSlice';
import { toggleSidebar, setSidebarOpen } from '../../store/slices/uiSlice';
import ProtectedRoute from '../common/ProtectedRoute';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await dispatch(logoutAsync());
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: `/${user?.role}/dashboard`,
        roles: ['patient', 'doctor', 'admin'],
      },
    ];

    if (user?.role === 'patient') {
      items.push(
        {
          text: 'My Profile',
          icon: <AccountCircle />,
          path: '/patient/profile',
          roles: ['patient'],
        },
        {
          text: 'Appointments',
          icon: <CalendarToday />,
          path: '/patient/appointments',
          roles: ['patient'],
        },
        {
          text: 'Find Doctors',
          icon: <MedicalServices />,
          path: '/patient/doctors',
          roles: ['patient'],
        }
      );
    }

    if (user?.role === 'doctor') {
      items.push(
        {
          text: 'My Schedule',
          icon: <CalendarToday />,
          path: '/doctor/schedule',
          roles: ['doctor'],
        },
        {
          text: 'Token Queue',
          icon: <LocalHospital />,
          path: '/doctor/tokens',
          roles: ['doctor'],
        },
        {
          text: 'Patients',
          icon: <People />,
          path: '/doctor/patients',
          roles: ['doctor'],
        }
      );
    }

    if (user?.role === 'admin') {
      items.push(
        {
          text: 'Users',
          icon: <People />,
          path: '/admin/users',
          roles: ['admin'],
        },
        {
          text: 'Doctors',
          icon: <MedicalServices />,
          path: '/admin/doctors',
          roles: ['admin'],
        },
        {
          text: 'Patients',
          icon: <People />,
          path: '/admin/patients',
          roles: ['admin'],
        },
        {
          text: 'Appointments',
          icon: <CalendarToday />,
          path: '/admin/appointments',
          roles: ['admin'],
        },
        {
          text: 'Analytics',
          icon: <Dashboard />,
          path: '/admin/analytics',
          roles: ['admin'],
        }
      );
    }

    return items.filter(item => item.roles.includes(user?.role || ''));
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Hospital AI
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
          </Typography>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 2 }}>
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main',
                  fontSize: '0.875rem',
                }}
              >
                {user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleNavigation(`/${user?.role}/profile`)}>
              <Avatar sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigation(`/${user?.role}/settings`)}>
              <Settings sx={{ mr: 2 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // AppBar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
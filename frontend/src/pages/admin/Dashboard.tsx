import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  People,
  MedicalServices,
  TrendingUp,
  AttachMoney,
  CalendarToday,
  Assessment,
  Settings,
  PersonAdd,
  Dashboard as DashboardIcon,
  Analytics,
  AdminPanelSettings,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchDashboardStats,
  fetchAnalytics,
  fetchSystemHealth,
} from '../../store/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import { logoutAsync } from '../../store/slices/authSlice';

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dashboardStats, analytics, systemHealth, isLoading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAnalytics('week'));
    dispatch(fetchSystemHealth());
  }, [dispatch]);

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleManageDoctors = () => {
    navigate('/admin/doctors');
  };

  const handleManagePatients = () => {
    navigate('/admin/patients');
  };

  const handleViewAnalytics = () => {
    navigate('/admin/analytics');
  };

  const handleViewAppointments = () => {
    navigate('/admin/appointments');
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate('/login');
  };

  if (isLoading && !dashboardStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 6,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Navigation Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            py: 2
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Doctor Management - Admin Panel
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<AdminPanelSettings />}
                  label="Administrator"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Logout />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ pt: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Welcome to Admin Dashboard
          </Typography>
          <Typography variant="h6" gutterBottom>
            Manage Hospital Operations & Monitor System Performance
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Oversee doctors, patients, appointments, and system analytics from your centralized dashboard.
          </Typography>

          {/* Quick Stats Overview */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                  <People sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats?.overview.total_patients || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Patients
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                  <MedicalServices sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats?.overview.total_doctors || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Doctors
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                  <CalendarToday sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats?.overview.today_appointments || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Today's Appointments
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                  <TrendingUp sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats?.overview.total_appointments || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Appointments
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Dashboard Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Management Actions */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={handleManageUsers}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Manage Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add, edit, and manage user accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={handleManageDoctors}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <MedicalServices sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Manage Doctors
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Oversee doctor profiles and specializations
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={handleManagePatients}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <People sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Manage Patients
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage patient records
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={handleViewAppointments}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CalendarToday sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Appointments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor and manage all appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Stats Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                System Overview
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      ${dashboardStats?.revenue.total_revenue?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      ${dashboardStats?.revenue.monthly_revenue?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Analytics />}
                  onClick={handleViewAnalytics}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate('/admin/settings')}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  System Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => navigate('/admin/reports')}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Generate Reports
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics & Reports
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Assessment />}
                  onClick={handleViewAnalytics}
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                >
                  Revenue Reports
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  fullWidth
                >
                  System Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demographics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Demographics
              </Typography>
              {dashboardStats?.demographics.gender_distribution && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Gender Distribution:
                  </Typography>
                  {dashboardStats.demographics.gender_distribution.map((item) => (
                    <Box key={item.gender} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {item.gender}: {item.count} patients
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Distribution
              </Typography>
              {dashboardStats?.demographics.department_distribution && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Doctors by Department:
                  </Typography>
                  {dashboardStats.demographics.department_distribution.map((item) => (
                    <Box key={item.department} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {item.department}: {item.count} doctors
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Health */}
      {systemHealth && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body1" color="success.main">
                  {systemHealth.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Database
                </Typography>
                <Typography variant="body1" color="success.main">
                  Connected
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Today's Appointments
                </Typography>
                <Typography variant="body1">
                  {systemHealth.recent_activity?.today_appointments || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Active Doctors
                </Typography>
                <Typography variant="body1">
                  {systemHealth.recent_activity?.active_doctors || 0}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminDashboard;
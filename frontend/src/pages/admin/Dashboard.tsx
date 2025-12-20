import React, { useEffect } from 'react';
import {
  Box,
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
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchDashboardStats,
  fetchAnalytics,
  fetchSystemHealth,
} from '../../store/slices/adminSlice';
import { useNavigate } from 'react-router-dom';

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
    <Box>
      {/* Welcome Section */}
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage hospital operations and monitor system performance
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Patients
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {dashboardStats?.overview.total_patients || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MedicalServices color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Doctors
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {dashboardStats?.overview.total_doctors || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarToday color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Appointments
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {dashboardStats?.overview.today_appointments || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {dashboardStats?.overview.total_users || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="h2">
                    ${dashboardStats?.revenue.total_revenue?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" component="h2">
                    ${dashboardStats?.revenue.monthly_revenue?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Management
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    startIcon={<People />}
                    onClick={handleManageUsers}
                    fullWidth
                  >
                    Manage Users
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    startIcon={<MedicalServices />}
                    onClick={handleManageDoctors}
                    fullWidth
                  >
                    Manage Doctors
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={handleManagePatients}
                    fullWidth
                  >
                    Manage Patients
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    onClick={handleViewAppointments}
                    fullWidth
                  >
                    View Appointments
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

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
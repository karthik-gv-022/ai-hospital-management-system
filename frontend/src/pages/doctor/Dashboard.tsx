import React, { useEffect, useState } from 'react';
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
  Chip,
  Avatar,
  Paper,
  IconButton,
  Badge,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CalendarToday,
  People,
  AccessTime,
  LocalHospital,
  TrendingUp,
  PlayArrow,
  Done,
  VideoCall,
  Chat,
  Schedule,
  CheckCircle,
  Pending,
  SmartToy,
  Analytics,
  Settings,
  Logout,
  AccountCircle,
  MedicalServices,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDoctorProfile, fetchTodayAppointments } from '../../store/slices/doctorSlice';
import { useNavigate } from 'react-router-dom';
import { logoutAsync } from '../../store/slices/authSlice';

const DoctorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, todayAppointments, isLoading, error } = useAppSelector(
    (state) => state.doctor
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchDoctorProfile());
    dispatch(fetchTodayAppointments());

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleViewSchedule = () => {
    navigate('/doctor/schedule');
  };

  const handleViewPatients = () => {
    navigate('/doctor/patients');
  };

  const handleManageTokens = () => {
    navigate('/doctor/tokens');
  };

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const handleAIAssistant = () => {
    navigate('/doctor/ai-assistant');
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate('/login');
  };

  if (isLoading && !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const scheduledAppointments = todayAppointments.filter(
    (apt) => apt.status === 'Scheduled'
  );

  const inProgressAppointments = todayAppointments.filter(
    (apt) => apt.status === 'In Progress'
  );

  const completedAppointments = todayAppointments.filter(
    (apt) => apt.status === 'Completed'
  );

  const completionRate = todayAppointments.length > 0
    ? Math.round((completedAppointments.length / todayAppointments.length) * 100)
    : 0;

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
                Doctor Management - Doctor Portal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<MedicalServices />}
                  label={`Dr. ${profile?.first_name || 'Doctor'}`}
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
            Welcome back, Dr. {profile?.first_name}! 👨‍⚕️
          </Typography>
          <Typography variant="h6" gutterBottom>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Manage your consultations and patient care with AI-powered insights.
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
                  <CalendarToday sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {scheduledAppointments.length}
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
                  <CheckCircle sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {completedAppointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Completed Today
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
                  <Pending sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {inProgressAppointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    In Progress
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
                    {completionRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Completion Rate
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Doctor Profile Header */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)' }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold">
                Dr. {profile?.first_name} {profile?.last_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {profile?.department}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, position: 'relative', overflow: 'visible' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge
                badgeContent={scheduledAppointments.length}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: 20, minWidth: 20 } }}
              >
                <CalendarToday sx={{ fontSize: 48, color: '#7C3AED', mb: 1 }} />
              </Badge>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {scheduledAppointments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Consultations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <VideoCall sx={{ fontSize: 48, color: '#22D3EE', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="secondary">
                {inProgressAppointments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {completedAppointments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: '#F59E0B', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  mt: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#F59E0B20',
                  '& .MuiLinearProgress-bar': { backgroundColor: '#F59E0B' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule
              </Typography>
              {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map((appointment) => (
                    <ListItem key={appointment.id} divider>
                      <ListItemText
                        primary={
                          appointment.patient
                            ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                            : 'Unknown Patient'
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {appointment.appointment_time} • {appointment.consultation_type}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {appointment.patient?.phone}
                            </Typography>
                            {appointment.symptoms && (
                              <Typography variant="caption" color="textSecondary">
                                Symptoms: {appointment.symptoms}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Chip
                        icon={appointment.status === 'Scheduled' ? <PlayArrow /> : <Done />}
                        label={appointment.status}
                        color={appointment.status === 'Scheduled' ? 'primary' : 'success'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">
                    No appointments scheduled for today
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<CalendarToday />}
                  onClick={handleViewSchedule}
                  fullWidth
                >
                  View Schedule
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalHospital />}
                  onClick={handleManageTokens}
                  fullWidth
                >
                  Manage Tokens
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  onClick={handleViewPatients}
                  fullWidth
                >
                  View Patients
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Availability Status */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Availability
              </Typography>
              {profile?.available_days && profile?.available_days.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Available Days:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {profile.available_days.map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Time: {profile?.available_time_start} - {profile?.available_time_end}
                  </Typography>
                  <Typography variant="body2">
                    Max Patients: {profile?.max_patients_per_day} per day
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No availability set
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Professional Summary */}
      {profile && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Professional Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {profile.department}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  License Number
                </Typography>
                <Typography variant="body1">
                  {profile.license_number}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Consultation Fee
                </Typography>
                <Typography variant="body1">
                  ${profile.consultation_fee}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {profile.email}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
    </Box>
  );
};

export default DoctorDashboard;
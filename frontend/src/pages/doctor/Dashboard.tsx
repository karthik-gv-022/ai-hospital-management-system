import React, { useEffect, useState } from 'react';
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
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDoctorProfile, fetchTodayAppointments } from '../../store/slices/doctorSlice';
import { useNavigate } from 'react-router-dom';

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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Welcome Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Welcome back, Dr. {profile?.first_name}! 👨‍⚕️
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
              Manage your consultations and patient care with AI-powered insights
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '2rem'
            }}
          >
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </Avatar>
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
    </Box>
  );
};

export default DoctorDashboard;
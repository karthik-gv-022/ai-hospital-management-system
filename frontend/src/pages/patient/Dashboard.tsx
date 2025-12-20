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
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday,
  LocalHospital,
  Person,
  MedicalServices,
  AccessTime,
  SmartToy,
  VideoCall,
  Chat,
  Star,
  Schedule,
  Add,
  Search,
  Healing,
  Psychology,
  Favorite,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPatientProfile, fetchUpcomingAppointments } from '../../store/slices/patientSlice';
import { useNavigate } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, upcomingAppointments, isLoading, error } = useAppSelector(
    (state) => state.patient
  );
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPatientProfile());
    dispatch(fetchUpcomingAppointments(7));
  }, [dispatch]);

  const handleBookAppointment = () => {
    navigate('/patient/appointments/book');
  };

  const handleFindDoctors = () => {
    navigate('/patient/doctors');
  };

  const handleViewProfile = () => {
    navigate('/patient/profile');
  };

  const handleAIConsultation = () => {
    setAiDialogOpen(true);
  };

  const handleEmergencyConsultation = () => {
    navigate('/patient/emergency');
  };

  const quickSpecialties = [
    { name: 'General Medicine', icon: <Healing />, color: '#7C3AED' },
    { name: 'Cardiology', icon: <Favorite />, color: '#EF4444' },
    { name: 'Dermatology', icon: <MedicalServices />, color: '#22D3EE' },
    { name: 'Psychology', icon: <Psychology />, color: '#F59E0B' },
  ];

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
              Welcome back, {profile?.first_name}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Your health journey starts here. Book appointments, get AI consultations, and manage your care.
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

      {/* Quick Actions Bar */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }}
            onClick={handleBookAppointment}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CalendarToday sx={{ fontSize: 48, color: '#7C3AED', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Book Appointment</Typography>
              <Typography variant="body2" color="text.secondary">Schedule with top doctors</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }}
            onClick={handleAIConsultation}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <SmartToy sx={{ fontSize: 48, color: '#22D3EE', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">AI Consultation</Typography>
              <Typography variant="body2" color="text.secondary">Instant health advice</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }}
            onClick={handleFindDoctors}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Search sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Find Doctors</Typography>
              <Typography variant="body2" color="text.secondary">Browse specialists</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }}
            onClick={handleEmergencyConsultation}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <LocalHospital sx={{ fontSize: 48, color: '#DC2626', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Emergency</Typography>
              <Typography variant="body2" color="text.secondary">24/7 urgent care</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column - Stats & Quick Specialties */}
        <Grid item xs={12} lg={4}>
          {/* Health Stats */}
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Your Health Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary" fontWeight="bold">
                      {profile?.total_appointments || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Visits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="secondary" fontWeight="bold">
                      {profile?.upcoming_appointments || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Blood Group</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {profile?.blood_group || 'Not set'}
                  </Typography>
                </Box>
                <Chip
                  label="Active Patient"
                  color="success"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Quick Specialties */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Popular Specialties
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Book appointments instantly
              </Typography>
              <Grid container spacing={1}>
                {quickSpecialties.map((specialty, index) => (
                  <Grid item xs={6} key={index}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'scale(1.02)' },
                        border: `1px solid ${specialty.color}20`,
                        borderRadius: 2
                      }}
                      onClick={() => navigate(`/patient/doctors?specialty=${specialty.name}`)}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ color: specialty.color, mb: 1 }}>
                          {specialty.icon}
                        </Box>
                        <Typography variant="caption" fontWeight="bold">
                          {specialty.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Appointments & AI Features */}
        <Grid item xs={12} lg={8}>
          {/* Upcoming Appointments */}
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Upcoming Appointments
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleBookAppointment}
                  sx={{ borderRadius: 2 }}
                >
                  Book New
                </Button>
              </Box>

              {upcomingAppointments.length > 0 ? (
                <List>
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      sx={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 2,
                        mb: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: '#7C3AED' }}>
                        {appointment.doctor?.first_name?.[0]}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                            </Typography>
                            <Chip
                              label={appointment.status}
                              size="small"
                              color={appointment.status === 'Scheduled' ? 'warning' : appointment.status === 'Completed' ? 'success' : 'info'}
                              sx={{ borderRadius: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} at {appointment.appointment_time}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {appointment.consultation_type} • {appointment.doctor?.specialization}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box textAlign="right">
                        <IconButton
                          sx={{
                            bgcolor: '#22D3EE20',
                            color: '#22D3EE',
                            '&:hover': { bgcolor: '#22D3EE30' }
                          }}
                        >
                          <VideoCall />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <CalendarToday sx={{ fontSize: 64, color: '#E5E7EB', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No upcoming appointments
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Schedule your first consultation with our expert doctors
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CalendarToday />}
                    onClick={handleBookAppointment}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)'
                    }}
                  >
                    Book Your First Appointment
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* AI Health Assistant */}
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SmartToy sx={{ fontSize: 32, color: '#7C3AED', mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    AI Health Assistant
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get instant health insights and recommendations
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Chat />}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 2,
                      borderColor: '#7C3AED',
                      color: '#7C3AED',
                      '&:hover': { borderColor: '#5B21B6', bgcolor: '#7C3AED10' }
                    }}
                    onClick={handleAIConsultation}
                  >
                    Symptom Checker
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<MedicalServices />}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 2,
                      borderColor: '#22D3EE',
                      color: '#22D3EE',
                      '&:hover': { borderColor: '#0891B2', bgcolor: '#22D3EE10' }
                    }}
                    onClick={() => navigate('/patient/health-tips')}
                  >
                    Health Tips
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Consultation Dialog */}
      <Dialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#7C3AED', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <SmartToy sx={{ mr: 1 }} />
            AI Health Consultation
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Our AI-powered health assistant can help you with:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>Symptom analysis and preliminary diagnosis</li>
            <li>Health condition information</li>
            <li>Medication guidance</li>
            <li>Preventive care recommendations</li>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Note: AI consultations are for informational purposes only and should not replace professional medical advice.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAiDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAiDialogOpen(false);
              navigate('/patient/ai-consultation');
            }}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)',
              borderRadius: 2
            }}
          >
            Start AI Consultation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientDashboard;
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
  Logout,
  AccountCircle,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPatientProfile, fetchUpcomingAppointments } from '../../store/slices/patientSlice';
import { useNavigate } from 'react-router-dom';
import { logoutAsync } from '../../store/slices/authSlice';

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

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate('/login');
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
                Doctor Management - Patient Portal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<Person />}
                  label={`${profile?.first_name || 'Patient'} ${profile?.last_name || ''}`}
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
            Welcome back, {profile?.first_name}! 👋
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your Health Journey Starts Here
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Book appointments, get AI consultations, and manage your healthcare with ease.
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
                    {upcomingAppointments.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Upcoming Appointments
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
                    {Array.isArray((profile as any)?.medical_history) ? (profile as any).medical_history.length : (profile?.total_appointments || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Medical Records
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
                  <SmartToy sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    AI
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    AI Consultations
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
                  <Star sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="bold">
                    4.8
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Average Rating
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Dashboard Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Quick Actions */}
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
              onClick={handleBookAppointment}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CalendarToday sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Book Appointment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule consultations with top doctors
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
              onClick={handleFindDoctors}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Search sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Find Doctors
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search and connect with healthcare professionals
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
              onClick={handleAIConsultation}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SmartToy sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  AI Consultation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get instant health advice from AI
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
              onClick={handleViewProfile}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Person sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your health records and preferences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Popular Specialties */}
        <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
          Popular Specialties
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {quickSpecialties.map((specialty, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(`/patient/doctors?specialty=${specialty.name}`)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: specialty.color, mb: 2, fontSize: 48 }}>
                    {specialty.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {specialty.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Upcoming Appointments
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <Grid item xs={12} md={4} key={appointment.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Dr. {appointment.doctor_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {appointment.specialization}
                    </Typography>
                    <Chip
                      label={appointment.status}
                      color={appointment.status === 'Confirmed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        )}
      </Container>

      {/* AI Consultation Dialog */}
      <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToy color="primary" />
            AI Health Consultation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Get instant health advice from our AI-powered medical assistant. Describe your symptoms and get preliminary guidance.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Note: This is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setAiDialogOpen(false);
              navigate('/patient/ai-consultation');
            }}
          >
            Start Consultation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

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
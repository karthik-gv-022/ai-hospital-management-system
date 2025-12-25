import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AccountCircle, MedicalServices, AdminPanelSettings } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPatientProfile, updatePatientProfile } from '../../store/slices/patientSlice';
import { fetchDoctorProfile } from '../../store/slices/doctorSlice';
import { useNavigate } from 'react-router-dom';

const PostLoginSetup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((s) => s.auth);
  const patientState = useAppSelector((s) => s.patient);
  const doctorState = useAppSelector((s) => s.doctor);

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const role = user?.role || 'patient';

  // Fetch profile for role
  useEffect(() => {
    if (!user) return;
    if (role === 'patient') {
      dispatch(fetchPatientProfile());
    } else if (role === 'doctor') {
      dispatch(fetchDoctorProfile());
    }
  }, [dispatch, role, user]);

  // Initialize form fields for patient
  useEffect(() => {
    if (role === 'patient' && patientState.profile) {
      setPhone(patientState.profile.phone || '');
      setAddress(patientState.profile.address || '');
    }
  }, [role, patientState.profile]);

  const isLoading = useMemo(() => {
    if (role === 'patient') return patientState.isLoading;
    if (role === 'doctor') return doctorState.isLoading;
    return false;
  }, [role, patientState.isLoading, doctorState.isLoading]);

  const serverError = useMemo(() => {
    return role === 'patient' ? patientState.error : doctorState.error;
  }, [role, patientState.error, doctorState.error]);

  const profileComplete = useMemo(() => {
    if (role === 'patient') {
      const p = patientState.profile;
      return !!(p && p.first_name && p.last_name && p.phone && p.date_of_birth && p.gender);
    }
    if (role === 'doctor') {
      const d = doctorState.profile;
      return !!(d && d.first_name && d.last_name && d.specialization && d.license_number);
    }
    // admin: treat as complete
    return true;
  }, [role, patientState.profile, doctorState.profile]);

  const handleSkipOrContinue = () => {
    if (role === 'patient') navigate('/patient');
    else if (role === 'doctor') navigate('/doctor');
    else navigate('/admin');
  };

  const handleSave = async () => {
    setLocalError(null);
    if (role === 'patient') {
      if (!phone) {
        setLocalError('Please provide a valid phone number');
        return;
      }
      setSubmitting(true);
      try {
        await dispatch(updatePatientProfile({ phone, address })).unwrap();
        handleSkipOrContinue();
      } catch (e: any) {
        setLocalError(typeof e === 'string' ? e : 'Failed to update profile');
      } finally {
        setSubmitting(false);
      }
    } else {
      // For doctor/admin, no immediate editable fields without backend endpoints here
      handleSkipOrContinue();
    }
  };

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
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Welcome, {user?.email}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Let’s finish setting up your account
          </Typography>
          <Box mt={2}>
            {role === 'patient' && (
              <Chip icon={<AccountCircle />} label="Patient" sx={{ color: 'white', borderColor: 'white' }} variant="outlined" />
            )}
            {role === 'doctor' && (
              <Chip icon={<MedicalServices />} label="Doctor" sx={{ color: 'white', borderColor: 'white', ml: 1 }} variant="outlined" />
            )}
            {role === 'admin' && (
              <Chip icon={<AdminPanelSettings />} label="Admin" sx={{ color: 'white', borderColor: 'white', ml: 1 }} variant="outlined" />
            )}
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>
        )}
        {localError && (
          <Alert severity="warning" sx={{ mb: 2 }}>{localError}</Alert>
        )}

        <Paper sx={{ p: 4 }}>
          {isLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {role === 'patient' && (
                <>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Basic Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone"
                        fullWidth
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Address"
                        fullWidth
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {role !== 'patient' && (
                <>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    You're all set! You can proceed to your dashboard.
                  </Typography>
                </>
              )}

              <Box display="flex" gap={2} mt={4}>
                <Button variant="outlined" color="inherit" onClick={handleSkipOrContinue}>
                  Skip & Continue
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={submitting || (role === 'patient' && !phone)}
                >
                  {submitting ? <CircularProgress size={20} color="inherit" /> : 'Save & Continue'}
                </Button>
                {profileComplete && (
                  <Button onClick={handleSkipOrContinue}>
                    Go to Dashboard
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default PostLoginSetup;

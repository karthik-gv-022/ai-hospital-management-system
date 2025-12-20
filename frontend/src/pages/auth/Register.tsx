import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  MedicalServices,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerAsync, registerDoctorAsync, clearError, clearSuccess } from '../../store/slices/authSlice';
// import types if needed in the future

// Dynamic validation schema based on user role
const getValidationSchema = (role: 'patient' | 'doctor') => {
  const baseSchema = {
    first_name: yup
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .required('First name is required'),
    last_name: yup
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .required('Last name is required'),
    email: yup
      .string()
      .email('Please enter a valid email')
      .required('Email is required'),
    phone: yup
      .string()
      .matches(/^[+]?[\d\s\-()]+$/, 'Please enter a valid phone number')
      .min(10, 'Phone number must be at least 10 digits')
      .required('Phone number is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  };

  if (role === 'patient') {
    return yup.object().shape({
      ...baseSchema,
      date_of_birth: yup
        .string()
        .required('Date of birth is required')
        .test('age', 'You must be at least 18 years old', function(value) {
          if (!value) return false;
          const dob = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          return age >= 18;
        }),
      gender: yup
        .string()
        .oneOf(['Male', 'Female', 'Other'], 'Please select a valid gender')
        .required('Gender is required'),
    });
  } else {
    return yup.object().shape({
      ...baseSchema,
      specialization: yup
        .string()
        .min(2, 'Specialization must be at least 2 characters')
        .max(100, 'Specialization must be less than 100 characters')
        .required('Specialization is required'),
      department: yup
        .string()
        .min(2, 'Department must be at least 2 characters')
        .max(100, 'Department must be less than 100 characters')
        .required('Department is required'),
      license_number: yup
        .string()
        .min(5, 'License number must be at least 5 characters')
        .max(100, 'License number must be less than 100 characters')
        .required('License number is required'),
      experience_years: yup
        .number()
        .min(0, 'Experience years cannot be negative')
        .max(50, 'Experience years cannot exceed 50')
        .required('Experience years is required'),
      consultation_fee: yup
        .number()
        .min(0, 'Consultation fee cannot be negative')
        .required('Consultation fee is required'),
      available_days: yup
        .array()
        .of(yup.string())
        .min(1, 'At least one available day is required')
        .required('Available days are required'),
      available_time_start: yup
        .string()
        .required('Available time start is required'),
      available_time_end: yup
        .string()
        .required('Available time end is required'),
      max_patients_per_day: yup
        .number()
        .min(1, 'Maximum patients per day must be at least 1')
        .max(100, 'Maximum patients per day cannot exceed 100')
        .required('Maximum patients per day is required'),
    });
  }
};

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isSuccess } = useAppSelector((state) => state.auth as any);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    // @ts-ignore - Dynamic schema typing issue
    resolver: yupResolver(getValidationSchema(userRole)),
    mode: 'onChange',
  });


  // Reset form when role changes
  useEffect(() => {
    reset();
  }, [userRole, reset]);

  // Redirect on successful registration
  useEffect(() => {
    if (isSuccess) {
      navigate('/login', {
        state: {
          message: 'Registration successful! Please sign in.',
        },
      });
    }
  }, [isSuccess, navigate]);

  // Clear error and success when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    dispatch(clearError());
    dispatch(clearSuccess());

    const { confirmPassword, ...registrationData } = data;

    try {
      if (userRole === 'patient') {
        await dispatch(registerAsync(registrationData)).unwrap();
      } else {
        await dispatch(registerDoctorAsync(registrationData)).unwrap();
      }
    } catch (error) {
      // Error is handled by Redux slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Set max date to 18 years ago from today
  const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <MedicalServices
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Doctor Management
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Register as a new {userRole}
            </Typography>
          </Box>

          {/* Role Selection */}
          <Box mb={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                Register as:
              </FormLabel>
              <RadioGroup
                row
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'patient' | 'doctor')}
              >
                <FormControlLabel value="patient" control={<Radio />} label="Patient" />
                <FormControlLabel value="doctor" control={<Radio />} label="Doctor" />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Common Fields - Name */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      disabled={isLoading || isSubmitting}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                      disabled={isLoading || isSubmitting}
                      margin="normal"
                    />
                  )}
                />
              </Grid>

              {/* Common Fields - Contact */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={isLoading || isSubmitting}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={isLoading || isSubmitting}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Patient-specific Fields */}
              {userRole === 'patient' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="date_of_birth"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Date of Birth"
                          type="date"
                          error={!!errors.date_of_birth}
                          helperText={errors.date_of_birth?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            max: getMaxDate(),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="Gender"
                          error={!!errors.gender}
                          helperText={errors.gender?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Doctor-specific Fields */}
              {userRole === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"specialization" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Specialization"
                          error={!!(errors as any).specialization}
                          helperText={(errors as any).specialization?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"department" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Department"
                          error={!!(errors as any).department}
                          helperText={(errors as any).department?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"license_number" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="License Number"
                          error={!!(errors as any).license_number}
                          helperText={(errors as any).license_number?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"experience_years" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Experience Years"
                          type="number"
                          error={!!(errors as any).experience_years}
                          helperText={(errors as any).experience_years?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          inputProps={{ min: 0, max: 50 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"consultation_fee" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Consultation Fee ($)"
                          type="number"
                          error={!!(errors as any).consultation_fee}
                          helperText={(errors as any).consultation_fee?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"max_patients_per_day" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Max Patients Per Day"
                          type="number"
                          error={!!(errors as any).max_patients_per_day}
                          helperText={(errors as any).max_patients_per_day?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          inputProps={{ min: 1, max: 100 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"available_time_start" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Start Time"
                          type="time"
                          error={!!(errors as any).available_time_start}
                          helperText={(errors as any).available_time_start?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={"available_time_end" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="End Time"
                          type="time"
                          error={!!(errors as any).available_time_end}
                          helperText={(errors as any).available_time_end?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name={"available_days" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          SelectProps={{
                            multiple: true,
                          }}
                          label="Available Days"
                          error={!!(errors as any).available_days}
                          helperText={(errors as any).available_days?.message}
                          disabled={isLoading || isSubmitting}
                          margin="normal"
                          value={field.value || []}
                        >
                          <MenuItem value="Monday">Monday</MenuItem>
                          <MenuItem value="Tuesday">Tuesday</MenuItem>
                          <MenuItem value="Wednesday">Wednesday</MenuItem>
                          <MenuItem value="Thursday">Thursday</MenuItem>
                          <MenuItem value="Friday">Friday</MenuItem>
                          <MenuItem value="Saturday">Saturday</MenuItem>
                          <MenuItem value="Sunday">Sunday</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Password Fields */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={isLoading || isSubmitting}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordVisibility}
                              edge="end"
                              disabled={isLoading || isSubmitting}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={isLoading || isSubmitting}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                              disabled={isLoading || isSubmitting}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading || isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading || isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            <Box textAlign="center">
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography variant="body2" color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
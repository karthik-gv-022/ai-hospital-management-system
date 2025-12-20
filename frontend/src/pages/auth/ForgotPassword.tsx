import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Email,
  MedicalServices,
  ArrowBack,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clearError } from '../../store/slices/authSlice';
import { apiPost } from '../../services/api';

// Validation schema
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

interface ForgotPasswordData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(forgotPasswordSchema) as any,
    mode: 'onChange',
  });

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsSubmitting(true);
    dispatch(clearError());

    try {
      await apiPost('/auth/forgot-password', data);
      setEmailSent(true);
    } catch (error: any) {
      // Error handling - for security, we show success even if email doesn't exist
      setEmailSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (emailSent) {
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
            maxWidth: 400,
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
                Check Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                We've sent a password reset link to {getValues('email')}
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              If an account with that email exists, you will receive a password reset link shortly.
            </Alert>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleBackToLogin}
              sx={{ mb: 2 }}
            >
              Back to Login
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Didn't receive the email?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => setEmailSent(false)}
                sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
              >
                Try again
              </Button>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
          maxWidth: 400,
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
              Enter your email address and we'll send you a link to reset your password
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Forgot Password Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                'Send Reset Link'
              )}
            </Button>

            <Box textAlign="center">
              <Button
                variant="text"
                size="small"
                onClick={handleBackToLogin}
                startIcon={<ArrowBack />}
                sx={{ textTransform: 'none' }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
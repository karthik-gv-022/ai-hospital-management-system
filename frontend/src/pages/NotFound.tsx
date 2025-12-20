import React from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          color="primary"
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          Sorry, the page you are looking for doesn't exist or has been moved.
          Please check the URL or go back to the previous page.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
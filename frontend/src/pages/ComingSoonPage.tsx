import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Build } from '@mui/icons-material';

const ComingSoonPage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Build sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              {description}
            </Typography>

            <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="body1">
                This feature is currently under development. We're working hard to bring you the best healthcare experience possible.
              </Typography>
            </Alert>

            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/')}
                  size="large"
                >
                  Back to Home
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  size="large"
                >
                  Login to Access Features
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ComingSoonPage;
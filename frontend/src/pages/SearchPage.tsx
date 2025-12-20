import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  // Mock doctor data
  const doctors = [
    {
      id: 1,
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.8,
      reviews: 125,
      location: 'Chennai, Tamil Nadu',
      available: true,
      image: '/assets/img/doctor1.jpg'
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.9,
      reviews: 98,
      location: 'Coimbatore, Tamil Nadu',
      available: true,
      image: '/assets/img/doctor2.jpg'
    },
    {
      id: 3,
      name: 'Dr. Michael Williams',
      specialty: 'Orthopedics',
      experience: '12 years',
      rating: 4.7,
      reviews: 156,
      location: 'Madurai, Tamil Nadu',
      available: false,
      image: '/assets/img/doctor3.jpg'
    }
  ];

  const handleSearch = () => {
    // In a real app, this would search the backend
    console.log('Searching for:', searchQuery, 'in', location);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Search Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Find Doctors Near You
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Search from 1000+ doctors across all specialties
          </Typography>

          {/* Search Form */}
          <Paper
            sx={{
              p: 3,
              maxWidth: 800,
              mx: 'auto',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search doctors, clinics, hospitals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSearch}
                  sx={{ height: 56 }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Doctors List */}
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
          Featured Doctors
        </Typography>

        <Grid container spacing={3}>
          {doctors.map((doctor) => (
            <Grid item xs={12} md={6} lg={4} key={doctor.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate('/login')} // Redirect to login for now
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{ width: 60, height: 60, mr: 2 }}
                      src={doctor.image}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {doctor.name}
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        {doctor.specialty}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ color: '#ffd700', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {doctor.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({doctor.reviews} reviews)
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {doctor.experience} experience
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                    {doctor.location}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={doctor.available ? 'Available' : 'Not Available'}
                      color={doctor.available ? 'success' : 'default'}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CalendarToday />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/login');
                      }}
                    >
                      Book Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Login Prompt */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Paper sx={{ p: 4, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Ready to Book an Appointment?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join thousands of patients who trust our healthcare platform
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login to Book Appointment
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchPage;
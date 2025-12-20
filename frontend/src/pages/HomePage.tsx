import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import {
  MedicalServices,
  LocalHospital,
  Science,
  ShoppingCart,
  Healing,
  Psychology,
  Favorite,
  Search,
  CalendarToday,
  Phone,
  LocationOn,
  Star,
  ArrowForward,
  PlayArrow,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Book Lab Test',
      description: 'It\'s fast, easy and secure',
      icon: <Science sx={{ fontSize: 40, color: '#1976d2' }} />,
      link: '/book-test',
      discount: 'Get Upto 25% OFF On Lab Test',
      image: '/assets/img/Book_Lab_Test.png'
    },
    {
      title: 'Book Appointment',
      description: 'For hospital & clinical admissions.',
      icon: <CalendarToday sx={{ fontSize: 40, color: '#1976d2' }} />,
      link: '/search',
      discount: '',
      image: '/assets/img/Book_Appointment.png'
    },
    {
      title: 'Buy Medicine',
      description: 'We got all your health needs covered!',
      icon: <ShoppingCart sx={{ fontSize: 40, color: '#1976d2' }} />,
      link: '/pharmacy',
      discount: 'Get Upto 25% OFF On Medicines',
      image: '/assets/img/Buy_Medicine.png'
    },
    {
      title: 'SURGERY ASSISTANCE',
      description: 'For best and affordable Surgical Treatment.',
      icon: <Healing sx={{ fontSize: 40, color: '#1976d2' }} />,
      link: '/surgery',
      discount: 'Get Upto 15% Savings',
      image: '/assets/img/SURGERY_ASSISTANCE.png'
    }
  ];

  const specialties = [
    { name: 'Urology', icon: <MedicalServices />, link: '/search?key=Urologist' },
    { name: 'Cardiology', icon: <Favorite />, link: '/search?key=Cardiologist' },
    { name: 'Orthopedics', icon: <Healing />, link: '/search?key=Orthopedic' },
    { name: 'Dermatology', icon: <MedicalServices />, link: '/search?key=Dermatologist' },
    { name: 'Psychology', icon: <Psychology />, link: '/search?key=Psychologist' },
    { name: 'General Medicine', icon: <LocalHospital />, link: '/search?key=General' },
  ];

  const blogPosts = [
    {
      title: 'Obesity In Children: Rising Trend And Prevention Tips',
      date: '09 Dec, 2025',
      image: '/uploads/media/thumb/6937cb93299cc.png',
      link: '/healthfeed/obesity-in-children'
    },
    {
      title: 'Everyday Habits That Slowly Harm Your Heart',
      date: '09 Dec, 2025',
      image: '/uploads/media/thumb/6937cbcc35d6f.png',
      link: '/healthfeed/heart-habits'
    },
    {
      title: 'Social Media Addiction: Impact On Teen Mental Health',
      date: '09 Dec, 2025',
      image: '/uploads/media/thumb/6937c349308dd.png',
      link: '/healthfeed/social-media-addiction'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
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
                Doctor Management
              </Typography>
              <Box>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ mr: 2 }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ pt: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Book Doctor Appointments Online Near You
          </Typography>
          <Typography variant="h5" gutterBottom>
            Largest Healthcare Network Across Tamil Nadu
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Find best doctors across specialities or hospitals in your city.
          </Typography>

          {/* Search Bar */}
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              maxWidth: 600,
              mx: 'auto',
              borderRadius: 2,
              mb: 4
            }}
          >
            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography sx={{ flexGrow: 1, color: 'text.secondary' }}>
              Select Location
            </Typography>
            <Typography sx={{ mx: 2, color: 'text.secondary' }}>
              Like : Diabetologist etc
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              <Search />
            </Button>
          </Paper>

          {/* Video Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Paper
              sx={{
                position: 'relative',
                width: 300,
                height: 200,
                backgroundColor: '#000',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
            >
              <PlayArrow sx={{ fontSize: 60, color: 'white' }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  p: 1,
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">
                  Doctor Management Info Video
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {service.description}
                  </Typography>
                  {service.discount && (
                    <Chip
                      label={service.discount}
                      color="primary"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate(service.link)}
                  >
                    {service.title === 'Book Lab Test' ? 'Find Diagnostic Center' :
                     service.title === 'Book Appointment' ? 'Find Doctors Now' :
                     service.title === 'Buy Medicine' ? 'Buy Now' :
                     'Consult Now'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ backgroundColor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Discover the Online Appointment!
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            A step-by-step guide to build an on-demand appointment for patients
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Avatar sx={{ width: 80, height: 80, backgroundColor: '#1976d2', mx: 'auto', mb: 2 }}>
                  <Search sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  FIND A DOCTOR
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  With more than 1000+ doctors and on mission to provide best care Health Care Service
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Avatar sx={{ width: 80, height: 80, backgroundColor: '#1976d2', mx: 'auto', mb: 2 }}>
                  <MedicalServices sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  VIEW DOCTOR
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Share your health concern here and we shall assign you a top doctor across the North East
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Avatar sx={{ width: 80, height: 80, backgroundColor: '#1976d2', mx: 'auto', mb: 2 }}>
                  <CalendarToday sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  BOOK A VISIT
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Book your time slot with doctor from your comfort zone
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/search')}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                px: 4,
                py: 1.5
              }}
            >
              Find Doctor
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Specialties Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Clinic and Specialities
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Find experienced doctors across all specialties
        </Typography>

        <Grid container spacing={3}>
          {specialties.map((specialty, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
                onClick={() => navigate(specialty.link)}
              >
                <CardContent>
                  <Avatar sx={{ width: 60, height: 60, backgroundColor: '#e3f2fd', mx: 'auto', mb: 2 }}>
                    {specialty.icon}
                  </Avatar>
                  <Typography variant="body2" fontWeight="bold">
                    {specialty.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Doctors Section */}
      <Box sx={{ backgroundColor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Book Our Doctor
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Quick appointment with doctors
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6} lg={4}>
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
                onClick={() => navigate('/login')}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      backgroundColor: '#e3f2fd',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <MedicalServices sx={{ fontSize: 50, color: '#1976d2' }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                    Dr. Sudipan Dey
                  </Typography>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Orthopedic Surgeon
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Star sx={{ color: '#ffd700', mr: 0.5 }} />
                    <Typography variant="body2">5.0 (43)</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Joint Pain, Bone Fracture, Swelling, Back Pain, Stiffness, Muscle Pain, Limited Movement
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                    Chennai
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    8 Years Experience
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button variant="outlined" size="small">
                      Consult Online
                    </Button>
                    <Button variant="contained" size="small">
                      Consult at Clinic
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/search')}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              View All Doctors
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pharmacy Section */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Get all your medicines.
              </Typography>
              <Typography variant="h4" gutterBottom color="text.secondary">
                Everytime. On time.
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Guaranteed availability<br />
                Home delivery in 24hrs
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/pharmacy')}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Order Medicines
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src="/assets/img/order.svg"
                  alt="Order Medicine"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Blog Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Get Every Single Updates Here.
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Online Health Information Library is for general people, patients, their families and friends who seek information on disease, procedure and certain medications.
        </Typography>

        <Grid container spacing={4}>
          {blogPosts.map((post, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(post.link)}
              >
                <Box sx={{ height: 200, backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Blog Image
                  </Typography>
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {post.date}
                  </Typography>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                    {post.title}
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />}>
                    Read more
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Ask a Question Section */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Have a Medical Question?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Ask our specialists and get professional medical advice for your health concerns
              </Typography>

              <Paper sx={{ p: 3, backgroundColor: 'white' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      placeholder="Select Specialization"
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select Specialization</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="pediatrics">Pediatrics</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ height: 56 }}
                    >
                      Ask Question
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Your Question"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary">
                  You'll need to log in to submit your question
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 200,
                    height: 150,
                    backgroundColor: '#e3f2fd',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Medical Question Banner
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Download App Section */}
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Download Doctor Management App
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Book appointment & health checkups; Online lab test & consult doctor online
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Get the link to download the app
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TextField
                  placeholder="+91"
                  sx={{
                    width: 80,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      color: 'black'
                    }
                  }}
                />
                <TextField
                  placeholder="Enter your mobile number"
                  sx={{
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      color: 'black'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'white',
                    color: '#1976d2',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  Send app link
                </Button>
              </Box>

              <Typography variant="body2" sx={{ mb: 2 }}>
                Doctor Management is a healthcare platform serving Tamil Nadu with 10000+ Doctors, 500+ Hospitals, lives touched of more than 2 lakhs patients.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    QR Code
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Play Store
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                For Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="About Us" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Booking Guide" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Pharmacy" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Careers" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="FAQ'S" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Helpful Links
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Book Appointment" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Search for doctors" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Search for hospitals" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Book Lab/Diagnostics Test" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Services" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Hospital Management Healthcare Pvt Ltd, Coimbatore, Tamil Nadu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1 }} />
                <Typography variant="body2">
                  +91 98765 98765
                </Typography>
              </Box>
              <Typography variant="body2">
                Customer Support: support@docathome.com
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Follow Us
              </Typography>
              <Box>
                <IconButton color="inherit">
                  <Facebook />
                </IconButton>
                <IconButton color="inherit">
                  <Twitter />
                </IconButton>
                <IconButton color="inherit">
                  <LinkedIn />
                </IconButton>
                <IconButton color="inherit">
                  <Instagram />
                </IconButton>
                <IconButton color="inherit">
                  <YouTube />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              © 2025 Doctor Management. All rights reserved.
            </Typography>
            <Box>
              <Button color="inherit" size="small">Terms and Conditions</Button>
              <Button color="inherit" size="small">Privacy Policy</Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
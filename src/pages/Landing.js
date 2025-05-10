import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FitnessCenterOutlined, 
  TimelineOutlined, 
  PersonOutlineOutlined,
  CheckCircleOutlineOutlined
} from '@mui/icons-material';

const Landing = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Work It Out
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
                Track your workouts, monitor your progress, and achieve your fitness goals
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Sign Up Free
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Log In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="/workout-illustration.svg"
                alt="Workout Illustration"
                sx={{ 
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom fontWeight="bold">
          Features
        </Typography>
        <Typography variant="h6" component="p" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to track your fitness journey
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <FitnessCenterOutlined sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Workout Tracking
                </Typography>
                <Typography align="center">
                  Create custom workout templates and track your exercises, sets, reps, and weights.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <TimelineOutlined sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Progress Charts
                </Typography>
                <Typography align="center">
                  Visualize your progress over time with detailed charts and analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <PersonOutlineOutlined sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Multi-User Support
                </Typography>
                <Typography align="center">
                  Track workouts for multiple users and compare progress between gym partners.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CheckCircleOutlineOutlined sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Weight Pre-filling
                </Typography>
                <Typography align="center">
                  Automatically pre-fill weights based on your previous workouts for faster tracking.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Ready to start tracking your workouts?
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              Join thousands of users who are already improving their fitness with Work It Out.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Get Started Now
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" component="h3" gutterBottom>
                Work It Out
              </Typography>
              <Typography variant="body2">
                &copy; 2025 Work It Out. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <RouterLink to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                  Login
                </RouterLink>
                <RouterLink to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                  Register
                </RouterLink>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;

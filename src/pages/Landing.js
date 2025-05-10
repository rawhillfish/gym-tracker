import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
          color: 'white', 
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2
                }}
              >
                Work It Out
              </Typography>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  mb: 4,
                  maxWidth: '600px',
                  mx: { xs: 'auto', md: 0 },
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Simple, effective workout tracking for your fitness journey
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
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
                  Sign Up
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
            {!isMobile && (
              <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
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
            )}
          </Grid>
        </Container>
      </Box>

      {/* Footer - Simplified */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" sx={{ mb: { xs: 1, sm: 0 } }}>
              &copy; 2025 Work It Out. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <RouterLink to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                Login
              </RouterLink>
              <RouterLink to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                Register
              </RouterLink>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;

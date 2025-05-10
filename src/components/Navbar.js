import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Menu, 
  Avatar, 
  Tooltip, 
  MenuItem, 
  IconButton,
  Divider,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuIcon from '@mui/icons-material/Menu';
import { 
  Link as RouterLink, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  AccountCircle, 
  Logout, 
  Login, 
  PersonAdd, 
  Settings,
  FitnessCenter,
  History,
  PhoneAndroid,
  Dashboard,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/' || location.pathname === '' || location.pathname === '/landing';

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/landing');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navigation items based on auth state and current page
  const getNavItems = () => {
    const items = [];
    
    if (!isLandingPage) {
      items.push(
        { text: 'Track Workout', icon: <FitnessCenter />, path: '/active' },
        { text: 'History', icon: <History />, path: '/history' }
      );
    }
    
    if (isAuthenticated) {
      items.push(
        { text: 'Mobile Track', icon: <PhoneAndroid />, path: '/mobile' },
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Management', icon: <AdminPanelSettings />, path: '/management' }
      );
    }
    
    return items;
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250, pt: 2, bgcolor: 'background.paper' }} role="presentation">
      <List>
        {getNavItems().map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              mb: 1,
              '&:hover': {
                bgcolor: 'rgba(142, 45, 226, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ px: 2, pb: 2 }}>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: currentUser?.color || 'primary.main',
                width: 40,
                height: 40,
                mr: 2
              }}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="subtitle1" noWrap>
              {currentUser?.name || 'User'}
            </Typography>
          </Box>
        ) : null}
        {isAuthenticated ? (
          <Button 
            fullWidth 
            variant="outlined" 
            color="primary" 
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ mb: 1 }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/login"
              startIcon={<Login />}
              sx={{ mb: 1 }}
              onClick={handleDrawerToggle}
            >
              Login
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary" 
              component={RouterLink} 
              to="/register"
              startIcon={<PersonAdd />}
              onClick={handleDrawerToggle}
            >
              Register
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(to right, #4a00e0, #8e2de2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          <FitnessCenterIcon sx={{ mr: 1 }} />
          Work It Out
        </Typography>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {getNavItems().map((item) => (
              <Button 
                key={item.text}
                color="inherit" 
                component={RouterLink} 
                to={item.path}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
            
            {isAuthenticated ? (
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: currentUser?.color || 'primary.light'
                    }}
                  >
                    {currentUser?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  component={RouterLink} 
                  to="/register"
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true // Better open performance on mobile
              }}
            >
              {drawer}
            </Drawer>
          </>
        )}
        
        {/* Account Menu (Desktop) */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem component={RouterLink} to="/profile">
            <Avatar sx={{ bgcolor: currentUser?.color || 'primary.main' }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Avatar>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem component={RouterLink} to="/dashboard">
            <ListItemIcon>
              <Dashboard fontSize="small" />
            </ListItemIcon>
            Dashboard
          </MenuItem>
          <MenuItem component={RouterLink} to="/management">
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemIcon,
  Tooltip,
  Collapse,
  Divider,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// TabPanel component to handle tab content display
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const WorkoutBuilder = ({ isSubTab = false }) => {
  const { currentUser, isAdmin: isAdminProp } = useAuth();
  const isAdmin = () => isAdminProp();
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [retiredTemplates, setRetiredTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [globalTemplates, setGlobalTemplates] = useState([]);
  
  const [exercises, setExercises] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    exercises: [],
    isGlobal: false
  });
  const [openExerciseDialog, setOpenExerciseDialog] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedTemplates, setExpandedTemplates] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Categories for exercises
  const categories = [
    'Arms',
    'Back',
    'Chest',
    'Core',
    'Legs (Calves)',
    'Legs (Glutes)',
    'Legs (Hamstring)',
    'Legs (Quads)',
    'Shoulders',
    'Other'
  ];

  // Category color mapping for visual distinction
  const categoryColors = {
    'Arms': '#f57c00',          // Orange
    'Back': '#2e7d32',          // Green
    'Chest': '#1976d2',         // Blue
    'Core': '#0097a7',          // Cyan
    'Legs (Calves)': '#ef9a9a', // Lighter Red
    'Legs (Glutes)': '#e57373', // Light Red
    'Legs (Hamstring)': '#c62828', // Dark Red
    'Legs (Quads)': '#d32f2f',  // Red
    'Shoulders': '#7b1fa2',     // Purple
    'Other': '#616161'          // Grey
  };

  useEffect(() => {
    // Fetch exercises for the exercise selection dialog
    const fetchExercises = async () => {
      try {
        const response = await apiService.getExercises();
        if (Array.isArray(response)) {
          setExercises(response);
          
          // Initialize all categories as expanded
          const initialExpandedState = categories.reduce((acc, category) => {
            acc[category] = true;
            return acc;
          }, {});
          setExpandedCategories(initialExpandedState);
        } else if (response && Array.isArray(response.data)) {
          setExercises(response.data);
          
          // Initialize all categories as expanded
          const initialExpandedState = categories.reduce((acc, category) => {
            acc[category] = true;
            return acc;
          }, {});
          setExpandedCategories(initialExpandedState);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    // Fetch workout templates
    const fetchWorkoutTemplates = async () => {
      try {
        // Fetch all templates (both user-specific and global)
        const response = await apiService.getWorkoutTemplates({ includeDeleted: true });
        
        if (Array.isArray(response)) {
          // Filter active and retired templates
          const active = response.filter(template => !template.isDeleted);
          const retired = response.filter(template => template.isDeleted);
          
          // Filter user-specific and global templates
          const userSpecific = active.filter(template => template.userId === (currentUser?.id || null));
          const global = active.filter(template => template.userId === null);
          
          setWorkoutTemplates(active);
          setRetiredTemplates(retired);
          setUserTemplates(userSpecific);
          setGlobalTemplates(global);
        } else if (response && Array.isArray(response.data)) {
          // Filter active and retired templates
          const active = response.data.filter(template => !template.isDeleted);
          const retired = response.data.filter(template => template.isDeleted);
          
          // Filter user-specific and global templates
          const userSpecific = active.filter(template => template.userId === (currentUser?.id || null));
          const global = active.filter(template => template.userId === null);
          
          setWorkoutTemplates(active);
          setRetiredTemplates(retired);
          setUserTemplates(userSpecific);
          setGlobalTemplates(global);
        }
      } catch (error) {
        console.error('Error fetching workout templates:', error);
      }
    };

    fetchWorkoutTemplates();
  }, [currentUser]);

  // Helper function to check if a string is a valid MongoDB ObjectId
  const isValidObjectId = (id) => {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Handle creating a new template
  const handleCreateTemplate = async () => {
    try {
      const response = await apiService.createWorkoutTemplate(newTemplate);
      
      // Update the appropriate template list based on whether it's global or user-specific
      if (newTemplate.isGlobal && isAdmin()) {
        setGlobalTemplates([response, ...globalTemplates]);
      } else {
        setUserTemplates([response, ...userTemplates]);
      }
      
      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        exercises: [],
        isGlobal: false
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  // Handle editing a template
  const handleEditTemplate = (template) => {
    // Check if user can edit this template
    const canEdit = template.userId === currentUser.id || (template.userId === null && isAdmin());
    
    if (!canEdit) {
      alert('You do not have permission to edit this template.');
      return;
    }
    
    setEditingTemplate({
      ...template,
      isGlobal: template.userId === null
    });
  };

  // Handle updating a template
  const handleUpdateTemplate = async () => {
    try {
      // Debug info
      console.log('Current user:', currentUser);
      console.log('Is admin function result:', isAdmin());
      console.log('Template being updated:', editingTemplate);
      
      // Check if converting between global and user-specific
      const wasGlobal = editingTemplate._id && 
        [...globalTemplates, ...userTemplates].find(t => t._id === editingTemplate._id)?.userId === null;
      
      // If converting to global, ensure user is admin
      if (!wasGlobal && editingTemplate.isGlobal && !isAdmin()) {
        alert('Only admin users can create global templates');
        return;
      }
      
      // If template was global but user is not admin, prevent changes to global status
      if (wasGlobal && !isAdmin()) {
        // Ensure we're not trying to change global status
        editingTemplate.isGlobal = true;
      }
      
      // Create a copy of the template with only the fields we want to send
      const templateToUpdate = {
        _id: editingTemplate._id,
        name: editingTemplate.name,
        description: editingTemplate.description,
        exercises: editingTemplate.exercises,
        isGlobal: editingTemplate.isGlobal
      };
      
      console.log('Sending template data to server:', templateToUpdate);
      
      const response = await apiService.updateWorkoutTemplate(templateToUpdate._id, templateToUpdate);
      
      // Update the appropriate template lists
      const updatedTemplate = response;
      
      // If the template was converted to global or from global
      if (updatedTemplate.userId === null) {
        // Template is now global
        setGlobalTemplates(globalTemplates.map(t => 
          t._id === updatedTemplate._id ? updatedTemplate : t
        ));
        setUserTemplates(userTemplates.filter(t => t._id !== updatedTemplate._id));
      } else {
        // Template is now user-specific
        setUserTemplates(userTemplates.map(t => 
          t._id === updatedTemplate._id ? updatedTemplate : t
        ));
        setGlobalTemplates(globalTemplates.filter(t => t._id !== updatedTemplate._id));
      }
      
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
      alert(`Error updating template: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (templateId) => {
    try {
      const templateToDelete = [...userTemplates, ...globalTemplates].find(t => t._id === templateId);
      
      // Check if user can delete this template
      const canDelete = templateToDelete.userId === currentUser.id || (templateToDelete.userId === null && isAdmin());
      
      if (!canDelete) {
        alert('You do not have permission to delete this template.');
        return;
      }
      
      await apiService.deleteWorkoutTemplate(templateId);
      
      // Update template lists
      if (templateToDelete.userId === null) {
        // It's a global template
        const updatedGlobalTemplates = globalTemplates.filter(t => t._id !== templateId);
        setGlobalTemplates(updatedGlobalTemplates);
      } else {
        // It's a user template
        const updatedUserTemplates = userTemplates.filter(t => t._id !== templateId);
        setUserTemplates(updatedUserTemplates);
      }
      
      // Add to retired templates
      setRetiredTemplates([
        { ...templateToDelete, isDeleted: true },
        ...retiredTemplates
      ]);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Handle permanently deleting a template
  const handlePermanentDelete = async (templateId) => {
    try {
      const templateToDelete = retiredTemplates.find(t => t._id === templateId);
      
      // Check if user can permanently delete this template
      const canDelete = templateToDelete.userId === currentUser.id || (templateToDelete.userId === null && isAdmin());
      
      if (!canDelete) {
        alert('You do not have permission to permanently delete this template.');
        return;
      }
      
      await apiService.permanentlyDeleteWorkoutTemplate(templateId);
      
      // Update retired templates list
      const updatedRetiredTemplates = retiredTemplates.filter(t => t._id !== templateId);
      setRetiredTemplates(updatedRetiredTemplates);
    } catch (error) {
      console.error('Error permanently deleting template:', error);
    }
  };

  // Handle restoring a template
  const handleRestoreTemplate = async (templateId) => {
    try {
      const templateToRestore = retiredTemplates.find(t => t._id === templateId);
      
      // Check if user can restore this template
      const canRestore = templateToRestore.userId === currentUser.id || (templateToRestore.userId === null && isAdmin());
      
      if (!canRestore) {
        alert('You do not have permission to restore this template.');
        return;
      }
      
      const response = await apiService.restoreWorkoutTemplate(templateId);
      
      // Update template lists
      const restoredTemplate = response;
      
      // Remove from retired templates
      const updatedRetiredTemplates = retiredTemplates.filter(t => t._id !== templateId);
      setRetiredTemplates(updatedRetiredTemplates);
      
      // Add to appropriate active templates list
      if (restoredTemplate.userId === null) {
        // It's a global template
        setGlobalTemplates([restoredTemplate, ...globalTemplates]);
      } else {
        // It's a user template
        setUserTemplates([restoredTemplate, ...userTemplates]);
      }
    } catch (error) {
      console.error('Error restoring template:', error);
    }
  };

  // Function to render a template item
  const renderTemplateItem = (template) => {
    const isExpanded = expandedTemplates.includes(template._id);
    const isUserTemplate = template.userId === currentUser.id;
    const isGlobalTemplate = template.userId === null;
    const canEdit = isUserTemplate || (isGlobalTemplate && isAdmin());
    
    return (
      <Paper 
        key={template._id} 
        elevation={2} 
        sx={{ 
          mb: 2, 
          p: 2,
          border: isGlobalTemplate ? '1px solid #1976d2' : 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div">
              {template.name}
              {isGlobalTemplate && (
                <Chip 
                  icon={<PublicIcon />} 
                  label="Global" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              )}
              {isUserTemplate && (
                <Chip 
                  icon={<PersonIcon />} 
                  label="Personal" 
                  size="small" 
                  color="secondary" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {template.description}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Start Workout">
              <IconButton 
                color="primary" 
                onClick={() => handleStartWorkout(template)}
              >
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <>
                <Tooltip title="Edit">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditTemplate(template)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteTemplate(template._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
              <IconButton onClick={() => toggleTemplateExpansion(template._id)}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Exercises:
          </Typography>
          <List dense>
            {template.exercises.map((exercise, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={exercise.name}
                  secondary={`${exercise.sets} sets × ${exercise.reps} reps`}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Paper>
    );
  };

  // Template edit dialog
  const renderTemplateEditDialog = () => {
    if (!editingTemplate) return null;
    
    return (
      <Dialog open={!!editingTemplate} onClose={() => setEditingTemplate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Workout Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Template Name"
            value={editingTemplate.name}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={editingTemplate.description}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
          />
          
          {isAdmin() && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Template Visibility
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={editingTemplate.isGlobal}
                  onChange={(e) => setEditingTemplate({ 
                    ...editingTemplate, 
                    isGlobal: e.target.checked 
                  })}
                />
                <Typography>Make this template global (available to all users)</Typography>
              </Box>
            </Box>
          )}
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Exercises
          </Typography>
          
          <List>
            {editingTemplate.exercises.map((exercise, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="move up"
                      disabled={index === 0}
                      onClick={() => handleMoveExercise(index, index - 1, true)}
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="move down"
                      disabled={index === editingTemplate.exercises.length - 1}
                      onClick={() => handleMoveExercise(index, index + 1, true)}
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveExercise(index, true)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle1">{exercise.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TextField
                      label="Sets"
                      type="number"
                      size="small"
                      value={exercise.sets}
                      onChange={(e) => {
                        const newExercises = [...editingTemplate.exercises];
                        newExercises[index] = {
                          ...newExercises[index],
                          sets: parseInt(e.target.value) || 1
                        };
                        setEditingTemplate({
                          ...editingTemplate,
                          exercises: newExercises
                        });
                      }}
                      sx={{ width: '80px', mr: 2 }}
                      InputProps={{ inputProps: { min: 1, max: 10 } }}
                    />
                    <TextField
                      label="Reps"
                      type="number"
                      size="small"
                      value={exercise.reps}
                      onChange={(e) => {
                        const newExercises = [...editingTemplate.exercises];
                        newExercises[index] = {
                          ...newExercises[index],
                          reps: parseInt(e.target.value) || 1
                        };
                        setEditingTemplate({
                          ...editingTemplate,
                          exercises: newExercises
                        });
                      }}
                      sx={{ width: '80px' }}
                      InputProps={{ inputProps: { min: 1, max: 30 } }}
                    />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedExercises([]);
              setOpenExerciseDialog(true);
            }}
            sx={{ mt: 2 }}
          >
            Add Exercises
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTemplate(null)}>Cancel</Button>
          <Button onClick={handleUpdateTemplate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Template create form
  const renderCreateForm = () => {
    if (!showCreateForm) return null;
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Workout Template
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Template Name"
          value={newTemplate.name}
          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          value={newTemplate.description}
          onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
        />
        
        {isAdmin() && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Template Visibility
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={newTemplate.isGlobal}
                onChange={(e) => setNewTemplate({ 
                  ...newTemplate, 
                  isGlobal: e.target.checked 
                })}
              />
              <Typography>Make this template global (available to all users)</Typography>
            </Box>
          </Box>
        )}
        
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Exercises
        </Typography>
        
        <List>
          {newTemplate.exercises.map((exercise, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="move up"
                    disabled={index === 0}
                    onClick={() => handleMoveExercise(index, index - 1)}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="move down"
                    disabled={index === newTemplate.exercises.length - 1}
                    onClick={() => handleMoveExercise(index, index + 1)}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1">{exercise.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TextField
                    label="Sets"
                    type="number"
                    size="small"
                    value={exercise.sets}
                    onChange={(e) => {
                      const newExercises = [...newTemplate.exercises];
                      newExercises[index] = {
                        ...newExercises[index],
                        sets: parseInt(e.target.value) || 1
                      };
                      setNewTemplate({
                        ...newTemplate,
                        exercises: newExercises
                      });
                    }}
                    sx={{ width: '80px', mr: 2 }}
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                  />
                  <TextField
                    label="Reps"
                    type="number"
                    size="small"
                    value={exercise.reps}
                    onChange={(e) => {
                      const newExercises = [...newTemplate.exercises];
                      newExercises[index] = {
                        ...newExercises[index],
                        reps: parseInt(e.target.value) || 1
                      };
                      setNewTemplate({
                        ...newTemplate,
                        exercises: newExercises
                      });
                    }}
                    sx={{ width: '80px' }}
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                  />
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedExercises([]);
            setOpenExerciseDialog(true);
          }}
          sx={{ mt: 2 }}
        >
          Add Exercises
        </Button>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={() => {
              setShowCreateForm(false);
              setNewTemplate({
                name: '',
                description: '',
                exercises: [],
                isGlobal: false
              });
            }}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTemplate}
            disabled={!newTemplate.name || newTemplate.exercises.length === 0}
          >
            Create Template
          </Button>
        </Box>
      </Paper>
    );
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle starting a workout with a template
  const handleStartWorkout = (template) => {
    // Navigate to the active workout page with the selected template
    window.location.href = `/active?template=${template._id}`;
  };

  // Toggle template expansion
  const toggleTemplateExpansion = (templateId) => {
    setExpandedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        return [...prev, templateId];
      }
    });
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle moving an exercise in the list
  const handleMoveExercise = (fromIndex, toIndex, isEditing = false) => {
    if (isEditing) {
      // Move exercise in the editing template
      const newExercises = [...editingTemplate.exercises];
      const [movedExercise] = newExercises.splice(fromIndex, 1);
      newExercises.splice(toIndex, 0, movedExercise);
      setEditingTemplate({
        ...editingTemplate,
        exercises: newExercises
      });
    } else {
      // Move exercise in the new template
      const newExercises = [...newTemplate.exercises];
      const [movedExercise] = newExercises.splice(fromIndex, 1);
      newExercises.splice(toIndex, 0, movedExercise);
      setNewTemplate({
        ...newTemplate,
        exercises: newExercises
      });
    }
  };

  // Handle removing an exercise from the list
  const handleRemoveExercise = (index, isEditing = false) => {
    if (isEditing) {
      // Remove exercise from the editing template
      const newExercises = [...editingTemplate.exercises];
      newExercises.splice(index, 1);
      setEditingTemplate({
        ...editingTemplate,
        exercises: newExercises
      });
    } else {
      // Remove exercise from the new template
      const newExercises = [...newTemplate.exercises];
      newExercises.splice(index, 1);
      setNewTemplate({
        ...newTemplate,
        exercises: newExercises
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: isSubTab ? 0 : 4, mb: 4 }}>
      {!isSubTab && (
        <Typography variant="h4" component="h1" gutterBottom>
          Workout Builder
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          Create New Template
        </Button>
        
        <TextField
          label="Search Templates"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '250px' }}
        />
      </Box>

      {/* Tabs for User and Global Templates */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="template tabs"
          variant="fullWidth"
        >
          <Tab 
            label="My Templates" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Global Templates" 
            icon={<PublicIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Retired Templates" 
            icon={<DeleteIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* User Templates Tab */}
      <TabPanel value={activeTab} index={0}>
        {userTemplates.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              You haven't created any personal workout templates yet.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Template
            </Button>
          </Paper>
        ) : (
          <Box>
            {userTemplates.filter(template => 
              template.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(template => renderTemplateItem(template))}
          </Box>
        )}
      </TabPanel>

      {/* Global Templates Tab */}
      <TabPanel value={activeTab} index={1}>
        {globalTemplates.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No global workout templates are available.
            </Typography>
          </Paper>
        ) : (
          <Box>
            {globalTemplates.filter(template => 
              template.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(template => renderTemplateItem(template))}
          </Box>
        )}
      </TabPanel>

      {/* Retired Templates Tab */}
      <TabPanel value={activeTab} index={2}>
        {retiredTemplates.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No retired templates found.
            </Typography>
          </Paper>
        ) : (
          <Box>
            {retiredTemplates.filter(template => 
              template.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(template => renderTemplateItem(template))}
          </Box>
        )}
      </TabPanel>

      {showCreateForm && renderCreateForm()}
      {editingTemplate && renderTemplateEditDialog()}
      
      {/* Exercise Selection Dialog */}
      <Dialog 
        open={openExerciseDialog} 
        onClose={() => setOpenExerciseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Exercises</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Exercises"
            type="text"
            fullWidth
            variant="outlined"
            value={exerciseSearchTerm}
            onChange={(e) => setExerciseSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {/* Group exercises by category */}
          <Box sx={{ mt: 2 }}>
            {(() => {
              // Group exercises by category
              const exercisesByCategory = {};
              
              // Initialize categories with empty arrays
              categories.forEach(category => {
                exercisesByCategory[category] = [];
              });
              
              // Populate categories with exercises that match the search term
              exercises.forEach(exercise => {
                if (exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())) {
                  if (exercisesByCategory[exercise.category]) {
                    exercisesByCategory[exercise.category].push(exercise);
                  } else {
                    // Handle case where exercise has a category not in our predefined list
                    if (!exercisesByCategory['Other']) {
                      exercisesByCategory['Other'] = [];
                    }
                    exercisesByCategory['Other'].push(exercise);
                  }
                }
              });
              
              return (
                <Box>
                  {categories.map(category => {
                    const categoryExercises = exercisesByCategory[category] || [];
                    if (categoryExercises.length === 0) return null;
                    
                    return (
                      <Paper 
                        key={category}
                        elevation={2} 
                        sx={{ 
                          mb: 2, 
                          overflow: 'hidden',
                          borderRadius: '8px',
                          border: `1px solid ${categoryColors[category]}40`
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            bgcolor: categoryColors[category], 
                            color: 'white',
                            px: 2,
                            py: 1,
                            borderBottom: expandedCategories[category] ? `1px solid ${categoryColors[category]}40` : 'none'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {category}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                ml: 1, 
                                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {categoryExercises.length}
                            </Typography>
                          </Box>
                          <IconButton 
                            onClick={() => toggleCategoryExpansion(category)} 
                            sx={{ color: 'white' }}
                            size="small"
                          >
                            {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                        <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                          <List sx={{ pt: 0, pb: 0 }}>
                            {categoryExercises.map((exercise, index) => (
                              <React.Fragment key={exercise._id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                  sx={{
                                    py: 1.5,
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                  }}
                                >
                                  <ListItemIcon>
                                    <Checkbox
                                      edge="start"
                                      checked={selectedExercises.some(e => e._id === exercise._id)}
                                      onChange={() => {
                                        if (selectedExercises.some(e => e._id === exercise._id)) {
                                          setSelectedExercises(selectedExercises.filter(e => e._id !== exercise._id));
                                        } else {
                                          setSelectedExercises([...selectedExercises, {
                                            ...exercise,
                                            sets: 3,
                                            reps: exercise.defaultReps || 8
                                          }]);
                                        }
                                      }}
                                    />
                                  </ListItemIcon>
                                  <Box sx={{ width: '100%' }}>
                                    <Typography variant="subtitle1">{exercise.name}</Typography>
                                    
                                    {selectedExercises.some(e => e._id === exercise._id) && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TextField
                                          label="Sets"
                                          type="number"
                                          size="small"
                                          value={selectedExercises.find(e => e._id === exercise._id)?.sets || 3}
                                          onChange={(e) => {
                                            const updatedExercises = selectedExercises.map(ex => {
                                              if (ex._id === exercise._id) {
                                                return {
                                                  ...ex,
                                                  sets: parseInt(e.target.value) || 1
                                                };
                                              }
                                              return ex;
                                            });
                                            setSelectedExercises(updatedExercises);
                                          }}
                                          sx={{ width: '80px', mr: 2 }}
                                          InputProps={{ inputProps: { min: 1, max: 10 } }}
                                        />
                                        <TextField
                                          label="Reps"
                                          type="number"
                                          size="small"
                                          value={selectedExercises.find(e => e._id === exercise._id)?.reps || 8}
                                          onChange={(e) => {
                                            const updatedExercises = selectedExercises.map(ex => {
                                              if (ex._id === exercise._id) {
                                                return {
                                                  ...ex,
                                                  reps: parseInt(e.target.value) || 1
                                                };
                                              }
                                              return ex;
                                            });
                                            setSelectedExercises(updatedExercises);
                                          }}
                                          sx={{ width: '80px' }}
                                          InputProps={{ inputProps: { min: 1, max: 30 } }}
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                </ListItem>
                              </React.Fragment>
                            ))}
                          </List>
                        </Collapse>
                      </Paper>
                    );
                  })}
                </Box>
              );
            })()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExerciseDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Add selected exercises to the template
              if (editingTemplate) {
                setEditingTemplate({
                  ...editingTemplate,
                  exercises: [...editingTemplate.exercises, ...selectedExercises]
                });
              } else {
                setNewTemplate({
                  ...newTemplate,
                  exercises: [...newTemplate.exercises, ...selectedExercises]
                });
              }
              setOpenExerciseDialog(false);
            }} 
            color="primary"
            disabled={selectedExercises.length === 0}
          >
            Add Selected Exercises
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkoutBuilder;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  FlightTakeoff as DroneIcon,
  Map as MapIcon,
  Assignment as MissionIcon,
  CheckCircle as CheckIcon,
  Flight as FlightIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  DoneAll as CompletedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';
import MapView from '../../components/maps/MapView';

export default function MissionPlanning() {
  const navigate = useNavigate();
  const {
    drones,
    missions,
    getMissions,
    getMission,
    createMission,
    updateMission,
    loading,
    error: contextError
  } = useDroneMission();

  const [activeStep, setActiveStep] = useState(0);
  const [missionCreated, setMissionCreated] = useState(false);
  const [error, setError] = useState('');
  const [activeMissions, setActiveMissions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const steps = ['Mission Details', 'Survey Area', 'Review & Create'];

  // Mission form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    drone: 'default-drone', // Default value to prevent validation errors when no drones are available
    surveyType: 'topographic',
    priority: 'medium',
    startDate: new Date(),
    endDate: null,
    estimatedDuration: '',
    coordinates: {
      center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
      boundary: [],
      flightPath: []
    },
    status: 'in-progress',
    progress: 0
  });

  const [errors, setErrors] = useState({});

  // Fetch active missions
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        await getMissions();
      } catch (err) {
        console.error('Failed to fetch missions', err);
      }
    };

    fetchMissions();
  }, [getMissions]);

  // Update active missions when missions change
  useEffect(() => {
    if (missions) {
      const active = missions.filter(mission => 
        mission.status === 'in-progress' || mission.status === 'scheduled'
      );
      setActiveMissions(active);
    }
  }, [missions]);

  // Reset form data when showing create form
  useEffect(() => {
    if (showCreateForm) {
      setFormData({
        name: '',
        description: '',
        drone: drones && drones.length > 0 ? drones[0]._id : 'default-drone',
        surveyType: 'topographic',
        priority: 'medium',
        startDate: new Date(),
        endDate: null,
        estimatedDuration: '',
        coordinates: {
          center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
          boundary: [],
          flightPath: []
        },
        status: 'in-progress',
        progress: 0
      });
      setActiveStep(0);
      setErrors({});
    }
  }, [showCreateForm, drones]);

  // Handle refreshing the mission list
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getMissions();
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    } catch (err) {
      console.error('Failed to refresh missions', err);
      setRefreshing(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle map coordinates changes
  const handleMapChange = (newCoordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        ...newCoordinates
      }
    }));
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Mission name is required';
    }
    
    // Skip drone validation if no drones available
    if (drones && drones.length > 0 && !formData.drone) {
      newErrors.drone = 'Please select a drone';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (activeStep > 0 && formData.coordinates.boundary.length < 3) {
      newErrors.coordinates = 'Please define a survey area with at least 3 points';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic info before proceeding
      const basicInfoErrors = {};
      
      if (!formData.name) {
        basicInfoErrors.name = 'Mission name is required';
      }
      
      // Skip drone validation if no drones available
      if (drones && drones.length > 0 && !formData.drone) {
        basicInfoErrors.drone = 'Please select a drone';
      }
      
      if (!formData.startDate) {
        basicInfoErrors.startDate = 'Start date is required';
      }
      
      if (Object.keys(basicInfoErrors).length > 0) {
        setErrors(basicInfoErrors);
        return;
      }
    }
    
    if (activeStep === 1) {
      // Validate map data before proceeding
      if (formData.coordinates.boundary.length < 3) {
        setErrors(prev => ({
          ...prev,
          coordinates: 'Please define a survey area with at least 3 points'
        }));
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle completing mission creation
  const handleMissionCreated = async () => {
    setMissionCreated(true);
    // Refresh missions to show the new one
    await getMissions();
    // Reset form after a short delay
    setTimeout(() => {
      setMissionCreated(false);
      setShowCreateForm(false);
    }, 2000);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const payload = {
        ...formData,
        // Convert Date objects to ISO strings for the API
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        // Ensure status is set to in-progress for new missions
        status: 'in-progress',
        progress: 0
      };
      
      await createMission(payload);
      handleMissionCreated();
    } catch (err) {
      const errorMsg = 'Failed to save mission';
      setError(errorMsg);
      console.error(err);
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calculate progress percent
  const calculateProgress = (mission) => {
    return mission.progress || 0;
  };
  
  // Render mission list
  const renderMissionList = () => {
    if (activeMissions.length === 0) {
      return (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 2
          }}
        >
          <DroneIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Active Missions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first mission to start monitoring your drone operations
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
          >
            Create New Mission
          </Button>
        </Paper>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        {activeMissions.map((mission, index) => (
          <React.Fragment key={mission._id || index}>
            <ListItem 
              alignItems="flex-start"
              secondaryAction={
                <Chip 
                  label={mission.status.toUpperCase()}
                  color={mission.status === 'completed' ? 'success' : 'primary'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              }
              sx={{ 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
              onClick={() => navigate(`/missions/${mission._id}`)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getPriorityColor(mission.priority) }}>
                  <DroneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="medium">
                    {mission.name}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
                      >
                        {formatDate(mission.startDate)}
                      </Typography>
                      
                      <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {mission.estimatedDuration ? `${mission.estimatedDuration} min` : 'Duration N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Progress: {calculateProgress(mission)}%
                      </Typography>
                      <Box
                        sx={{
                          ml: 1,
                          width: '60%',
                          height: 6,
                          bgcolor: 'background.default',
                          borderRadius: 5,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${calculateProgress(mission)}%`,
                            height: '100%',
                            bgcolor: getPriorityColor(mission.priority),
                            transition: 'width 0.5s ease-in-out'
                          }}
                        />
                      </Box>
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < activeMissions.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // Render step content for mission form
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Mission Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Mission Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.drone}>
                <InputLabel>Drone</InputLabel>
                <Select
                  name="drone"
                  value={formData.drone}
                  onChange={handleChange}
                  label="Drone"
                >
                  {drones && drones.length > 0 ? (
                    drones.map(drone => (
                      <MenuItem 
                        key={drone._id} 
                        value={drone._id}
                        disabled={drone.status !== 'available' && drone._id !== formData.drone}
                      >
                        {drone.name} - {drone.model}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="default-drone">Default Drone (No drones available)</MenuItem>
                  )}
                </Select>
                {errors.drone && <FormHelperText>{errors.drone}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Survey Type</InputLabel>
                <Select
                  name="surveyType"
                  value={formData.surveyType}
                  onChange={handleChange}
                  label="Survey Type"
                >
                  <MenuItem value="topographic">Topographic</MenuItem>
                  <MenuItem value="aerial">Aerial Imagery</MenuItem>
                  <MenuItem value="infrared">Infrared</MenuItem>
                  <MenuItem value="volumetric">Volumetric</MenuItem>
                  <MenuItem value="inspection">Structure Inspection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date (Optional)"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="estimatedDuration"
                label="Estimated Duration (minutes)"
                type="number"
                fullWidth
                value={formData.estimatedDuration}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Define the survey area by clicking on the map to create boundary points. Click on the first point to close the polygon.
            </Typography>
            
            {errors.coordinates && (
              <Alert severity="error" sx={{ mb: 2 }}>{errors.coordinates}</Alert>
            )}
            
            <Box sx={{ height: 500, mb: 2, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
              {/* Fallback display in case MapView is not rendering properly */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 0
                }}
              >
                <MapIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Map Area
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '80%', textAlign: 'center', mt: 1 }}>
                  Click to add boundary points. Connect at least 3 points to define your survey area.
                </Typography>
              </Box>
              
              {/* Actual MapView component */}
              <Box sx={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
                <MapView 
                  center={formData.coordinates.center}
                  boundary={formData.coordinates.boundary}
                  flightPath={formData.coordinates.flightPath}
                  onChange={handleMapChange}
                  readOnly={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Mission Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {formData.name}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Description:</strong> {formData.description || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Drone:</strong> {
                        drones && drones.length > 0 
                          ? drones.find(d => d._id === formData.drone)?.name || 'N/A'
                          : 'Default Drone'
                      }
                    </Typography>
                    <Typography variant="body1">
                      <strong>Survey Type:</strong> {formData.surveyType}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Priority:</strong> {formData.priority}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Start Date:</strong> {formData.startDate.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      <strong>End Date:</strong> {formData.endDate ? formData.endDate.toLocaleDateString() : 'Not set'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Est. Duration:</strong> {formData.estimatedDuration ? `${formData.estimatedDuration} minutes` : 'Not specified'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Survey Area
                  </Typography>
                  <Box sx={{ height: 300, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                    {/* Fallback display */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 0
                      }}
                    >
                      <MapIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Survey Area Preview
                      </Typography>
                    </Box>
                    
                    {/* Actual MapView */}
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
                      <MapView 
                        center={formData.coordinates.center}
                        boundary={formData.coordinates.boundary}
                        flightPath={formData.coordinates.flightPath}
                        readOnly={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Area includes {formData.coordinates.boundary.length} boundary points
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Mission Planning
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Create and manage your drone missions
          </Typography>
        </Box>
        
        {!showCreateForm && !missionCreated && (
          <Box>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ mr: 1 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
            >
              Create Mission
            </Button>
          </Box>
        )}
      </Box>

      {(error || contextError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || contextError}
        </Alert>
      )}

      {/* Main content */}
      {missionCreated ? (
        <Paper sx={{ p: 4, textAlign: 'center', my: 4 }}>
          <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Mission Created Successfully!
          </Typography>
          <Typography variant="body1">
            Your mission has been created and added to active missions.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setMissionCreated(false)}
            >
              Return to Mission Planning
            </Button>
          </Box>
        </Paper>
      ) : showCreateForm ? (
        <>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Create New Mission</Typography>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => setShowCreateForm(false)}
              >
                Back to Missions
              </Button>
            </Box>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconProps={{ 
                      icon: index === 0 ? <MissionIcon /> : index === 1 ? <MapIcon /> : <DroneIcon /> 
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                {getStepContent(activeStep)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={activeStep === 0 ? () => setShowCreateForm(false) : handleBack}
                  >
                    {activeStep === 0 ? 'Cancel' : 'Back'}
                  </Button>
                  <Box>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        startIcon={<SaveIcon />}
                      >
                        Create Mission
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </form>
            )}
          </Paper>
        </>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Active Missions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These are your current active missions. Click on a mission to view details or update its status.
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderMissionList()
          )}
        </>
      )}
    </Container>
  );
}
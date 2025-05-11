import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
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
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  FlightTakeoff as DroneIcon,
  Map as MapIcon,
  Assignment as MissionIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';
import MapView from '../../components/maps/MapView';

// Added new props: onMissionCreated and onError
export default function MissionForm({ onMissionCreated, onError }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    drones, 
    getMission, 
    createMission, 
    updateMission, 
    loading 
  } = useDroneMission();
  
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Information', 'Survey Area', 'Review'];
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    drone: 'Dji',
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
    status: 'in-progress', // Set default status to in-progress
    progress: 0 // Add progress field
  });
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch mission data if editing
  useEffect(() => {
    const fetchMission = async () => {
      if (id && id !== 'new') {
        try {
          const missionData = await getMission(id);
          
          // Convert string dates to Date objects for the date picker
          const formattedData = {
            ...missionData,
            startDate: missionData.startDate ? new Date(missionData.startDate) : new Date(),
            endDate: missionData.endDate ? new Date(missionData.endDate) : null
          };
          
          setFormData(formattedData);
          setIsEditing(true);
        } catch (err) {
          const errorMsg = 'Failed to fetch mission data';
          setSubmitError(errorMsg);
          if (onError) onError(errorMsg);
          console.error(err);
        }
      }
    };
    
    fetchMission();
  }, [id, getMission, onError]);
  
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
    
    if (!formData.drone) {
      newErrors.drone = 'Please select a drone';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.coordinates.boundary.length < 3) {
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
      
      if (!formData.drone) {
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
        status: isEditing ? formData.status : 'in-progress',
        progress: isEditing ? formData.progress : 0
      };
      
      if (isEditing) {
        await updateMission(id, payload);
        navigate('/missions');
      } else {
        await createMission(payload);
        // Call onMissionCreated callback if provided
        if (onMissionCreated) {
          onMissionCreated();
        } else {
          navigate('/missions');
        }
      }
    } catch (err) {
      const errorMsg = 'Failed to save mission';
      setSubmitError(errorMsg);
      if (onError) onError(errorMsg);
      console.error(err);
    }
  };
  
  // Render step content
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
                  {drones.map(drone => (
                    <MenuItem 
                      key={drone._id} 
                      value={drone._id}
                      disabled={drone.status !== 'available' && drone._id !== formData.drone}
                    >
                      {drone.name} - {drone.model}
                    </MenuItem>
                  ))}
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
            
            <Box sx={{ height: 500, mb: 2 }}>
              <MapView 
                center={formData.coordinates.center}
                boundary={formData.coordinates.boundary}
                flightPath={formData.coordinates.flightPath}
                onChange={handleMapChange}
                readOnly={false}
              />
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
                      <strong>Drone:</strong> {drones.find(d => d._id === formData.drone)?.name || 'N/A'}
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
                  <Box sx={{ height: 300 }}>
                    <MapView 
                      center={formData.coordinates.center}
                      boundary={formData.coordinates.boundary}
                      flightPath={formData.coordinates.flightPath}
                      readOnly={true}
                    />
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
    <Box>
      {/* Header - only show if not being used in MissionPlanning */}
      {!onMissionCreated && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/missions')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4">{isEditing ? 'Edit Mission' : 'New Mission'}</Typography>
          </Box>
        </Box>
      )}
      
      {submitError && !onError && (
        <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>
      )}
      
      {/* Skip Stepper when rendered inside MissionPlanning */}
      {!onMissionCreated && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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
      )}
      
      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      startIcon={<SaveIcon />}
                    >
                      {isEditing ? 'Update Mission' : 'Create Mission'}
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
            </>
          )}
        </form>
      </Box>
    </Box>
  );
}
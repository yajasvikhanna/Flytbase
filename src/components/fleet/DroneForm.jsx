import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider, 
  IconButton 
} from '@mui/material';
import { 
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDroneMission } from '../../contexts/DroneMissionContext';

export default function DroneForm({ drone = null, onCancel }) {
  const navigate = useNavigate();
  const { addDrone, updateDrone } = useDroneMission();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    status: 'available',
    batteryCapacity: '',
    maxFlightTime: '',
    maxSpeed: '',
    maxAltitude: '',
    weight: '',
    cameraSpecs: '',
    notes: ''
  });

  useEffect(() => {
    // If editing an existing drone, populate the form
    if (drone) {
      setFormData({
        name: drone.name || '',
        model: drone.model || '',
        serialNumber: drone.serialNumber || '',
        status: drone.status || 'available',
        batteryCapacity: drone.specifications?.batteryCapacity || '',
        maxFlightTime: drone.specifications?.maxFlightTime || '',
        maxSpeed: drone.specifications?.maxSpeed || '',
        maxAltitude: drone.specifications?.maxAltitude || '',
        weight: drone.specifications?.weight || '',
        cameraSpecs: drone.specifications?.cameraSpecs || '',
        notes: drone.notes || ''
      });
    }
  }, [drone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const droneData = {
        name: formData.name,
        model: formData.model,
        serialNumber: formData.serialNumber,
        status: formData.status,
        specifications: {
          batteryCapacity: formData.batteryCapacity,
          maxFlightTime: formData.maxFlightTime,
          maxSpeed: formData.maxSpeed,
          maxAltitude: formData.maxAltitude,
          weight: formData.weight,
          cameraSpecs: formData.cameraSpecs
        },
        notes: formData.notes
      };

      if (drone) {
        // Update existing drone
        await updateDrone(drone._id, droneData);
        setSuccess('Drone updated successfully!');
        setTimeout(() => {
          navigate(`/fleet/${drone._id}`);
        }, 1500);
      } else {
        // Add new drone
        await addDrone(droneData);
        setSuccess('Drone added successfully!');
        setFormData({
          name: '',
          model: '',
          serialNumber: '',
          status: 'available',
          batteryCapacity: '',
          maxFlightTime: '',
          maxSpeed: '',
          maxAltitude: '',
          weight: '',
          cameraSpecs: '',
          notes: ''
        });
        setTimeout(() => {
          navigate('/fleet');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          onClick={() => navigate('/fleet')} 
          aria-label="back" 
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          {drone ? 'Edit Drone' : 'Add New Drone'}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              name="name"
              label="Drone Name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              name="model"
              label="Model"
              value={formData.model}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              name="serialNumber"
              label="Serial Number"
              value={formData.serialNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="in-use">In Use</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Technical Specifications</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="batteryCapacity"
              label="Battery Capacity (mAh)"
              value={formData.batteryCapacity}
              onChange={handleInputChange}
              variant="outlined"
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="maxFlightTime"
              label="Max Flight Time (minutes)"
              value={formData.maxFlightTime}
              onChange={handleInputChange}
              variant="outlined"
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="maxSpeed"
              label="Max Speed (km/h)"
              value={formData.maxSpeed}
              onChange={handleInputChange}
              variant="outlined"
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="maxAltitude"
              label="Max Altitude (m)"
              value={formData.maxAltitude}
              onChange={handleInputChange}
              variant="outlined"
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="weight"
              label="Weight (g)"
              value={formData.weight}
              onChange={handleInputChange}
              variant="outlined"
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="cameraSpecs"
              label="Camera Specifications"
              value={formData.cameraSpecs}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleInputChange}
              variant="outlined"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel || (() => navigate('/fleet'))}
              sx={{ mr: 2 }}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {drone ? 'Update Drone' : 'Add Drone'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
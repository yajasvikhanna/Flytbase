import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function DroneForm({ drone = {}, onSubmit }) {
  const defaultDrone = {
    name: '',
    model: '',
    serialNumber: '',
    status: 'available',
    batteryLevel: 100,
    specifications: {
      dimensions: '',
      weight: '',
      maxFlightTime: '',
      maxSpeed: '',
      maxAltitude: '',
      cameraResolution: '',
      operatingTemperature: '',
      commRange: ''
    },
    currentLocation: {
      name: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    flightHours: 0,
    missionCount: 0,
    ...drone
  };
  
  const [formData, setFormData] = useState(defaultDrone);
  const [nextMaintenance, setNextMaintenance] = useState(
    drone.nextMaintenance ? new Date(drone.nextMaintenance) : null
  );
  
  // Update form data when drone prop changes
  useEffect(() => {
    if (drone) {
      setFormData({
        ...defaultDrone,
        ...drone,
        specifications: {
          ...defaultDrone.specifications,
          ...(drone.specifications || {})
        },
        currentLocation: {
          ...defaultDrone.currentLocation,
          ...(drone.currentLocation || {}),
          coordinates: {
            ...defaultDrone.currentLocation.coordinates,
            ...(drone.currentLocation?.coordinates || {})
          }
        }
      });
      
      if (drone.nextMaintenance) {
        setNextMaintenance(new Date(drone.nextMaintenance));
      }
    }
  }, [drone]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [name]: value
      }
    });
  };
  
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        currentLocation: {
          ...formData.currentLocation,
          coordinates: {
            ...formData.currentLocation.coordinates,
            [child]: value
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        currentLocation: {
          ...formData.currentLocation,
          [name]: value
        }
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare form data with next maintenance date
    const finalFormData = {
      ...formData,
      nextMaintenance: nextMaintenance ? nextMaintenance.toISOString() : null
    };
    
    onSubmit(finalFormData);
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Drone Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Serial Number"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <RadioGroup
              row
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <FormControlLabel value="available" control={<Radio />} label="Available" />
              <FormControlLabel value="in-mission" control={<Radio />} label="In Mission" />
              <FormControlLabel value="maintenance" control={<Radio />} label="Maintenance" />
              <FormControlLabel value="charging" control={<Radio />} label="Charging" />
              <FormControlLabel value="offline" control={<Radio />} label="Offline" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Battery Level (%)"
            name="batteryLevel"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100 }
            }}
            value={formData.batteryLevel}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Flight Hours"
            name="flightHours"
            InputProps={{
              endAdornment: <InputAdornment position="end">hours</InputAdornment>,
              inputProps: { min: 0 }
            }}
            value={formData.flightHours}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Mission Count"
            name="missionCount"
            InputProps={{ inputProps: { min: 0 } }}
            value={formData.missionCount}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Next Scheduled Maintenance"
              value={nextMaintenance}
              onChange={(newValue) => setNextMaintenance(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        {/* Location Information */}
        <Grid item xs={12}>
          <Typography variamission hnt="h6" gutterBottom>
            Current Location
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Location Name"
            name="name"
            value={formData.currentLocation?.name || ''}
            onChange={handleLocationChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Latitude"
            name="coordinates.lat"
            value={formData.currentLocation?.coordinates?.lat || ''}
            onChange={handleLocationChange}
            InputProps={{ inputProps: { step: 'any' } }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Longitude"
            name="coordinates.lng"
            value={formData.currentLocation?.coordinates?.lng || ''}
            onChange={handleLocationChange}
            InputProps={{ inputProps: { step: 'any' } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        {/* Technical Specifications */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Technical Specifications
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Dimensions"
            name="dimensions"
            placeholder="e.g., 350 x 350 x 200 mm"
            value={formData.specifications?.dimensions || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Weight"
            name="weight"
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
              inputProps: { min: 0, step: 'any' }
            }}
            value={formData.specifications?.weight || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Max Flight Time"
            name="maxFlightTime"
            InputProps={{
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
              inputProps: { min: 0 }
            }}
            value={formData.specifications?.maxFlightTime || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Max Speed"
            name="maxSpeed"
            InputProps={{
              endAdornment: <InputAdornment position="end">km/h</InputAdornment>,
              inputProps: { min: 0 }
            }}
            value={formData.specifications?.maxSpeed || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Max Altitude"
            name="maxAltitude"
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
              inputProps: { min: 0 }
            }}
            value={formData.specifications?.maxAltitude || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Camera Resolution"
            name="cameraResolution"
            placeholder="e.g., 4K (3840×2160)"
            value={formData.specifications?.cameraResolution || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Operating Temperature"
            name="operatingTemperature"
            placeholder="e.g., -10°C to 40°C"
            value={formData.specifications?.operatingTemperature || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Communication Range"
            name="commRange"
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
              inputProps: { min: 0, step: 'any' }
            }}
            value={formData.specifications?.commRange || ''}
            onChange={handleSpecChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" size="large">
              {drone._id ? 'Update Drone' : 'Add Drone'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
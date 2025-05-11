import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Container,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  Alert
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AirplanemodeActive as DroneIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import Avatar from '@mui/material/Avatar';
import Slider from '@mui/material/Slider';

export default function FleetManagement() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [showAddDrone, setShowAddDrone] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDroneId, setEditingDroneId] = useState(null);
  
  // Mock data for drone fleet
  const [drones, setDrones] = useState([
    { id: 1, name: 'Drone Alpha', status: 'available', battery: 95, lastMaintenance: '2025-04-28', model: 'DJI Mavic 3', serialNumber: 'MAV-2025-001' },
    { id: 2, name: 'Drone Beta', status: 'deployed', battery: 68, lastMaintenance: '2025-04-15', model: 'Autel EVO II', serialNumber: 'AEV-2025-042' },
    { id: 3, name: 'Drone Gamma', status: 'maintenance', battery: 12, lastMaintenance: '2025-05-09', model: 'Skydio 2+', serialNumber: 'SKY-2025-103' },
    { id: 4, name: 'Drone Delta', status: 'available', battery: 87, lastMaintenance: '2025-05-01', model: 'DJI Air 3S', serialNumber: 'AIR-2025-217' },
    { id: 5, name: 'Drone Epsilon', status: 'deployed', battery: 42, lastMaintenance: '2025-04-22', model: 'Yuneec H520', serialNumber: 'YUN-2025-089' },
  ]);
  
  // Form state for new or edited drone
  const [droneFormData, setDroneFormData] = useState({
    name: '',
    status: 'available',
    battery: 100,
    lastMaintenance: new Date().toISOString().split('T')[0],
    model: '',
    serialNumber: ''
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddDrone = () => {
    setEditingDroneId(null);
    setDroneFormData({
      name: '',
      status: 'available',
      battery: 100,
      lastMaintenance: new Date().toISOString().split('T')[0],
      model: '',
      serialNumber: ''
    });
    setShowAddDrone(true);
  };
  
  const handleEditDrone = (droneId) => {
    const droneToEdit = drones.find(drone => drone.id === droneId);
    if (droneToEdit) {
      setEditingDroneId(droneId);
      setDroneFormData({
        ...droneToEdit
      });
      setShowAddDrone(true);
    }
  };

  const handleCancelAdd = () => {
    setShowAddDrone(false);
    setEditingDroneId(null);
    // Reset form data
    setDroneFormData({
      name: '',
      status: 'available',
      battery: 100,
      lastMaintenance: new Date().toISOString().split('T')[0],
      model: '',
      serialNumber: ''
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDroneFormData({
      ...droneFormData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!droneFormData.name) return; // Basic validation
    
    if (editingDroneId !== null) {
      // Update existing drone
      setDrones(drones.map(drone => 
        drone.id === editingDroneId ? { ...droneFormData, id: editingDroneId } : drone
      ));
    } else {
      // Add new drone
      const newDroneWithId = {
        ...droneFormData,
        id: drones.length + 1
      };
      setDrones([...drones, newDroneWithId]);
    }
    
    setShowAddDrone(false);
    setEditingDroneId(null);
    
    // Reset form
    setDroneFormData({
      name: '',
      status: 'available',
      battery: 100,
      lastMaintenance: new Date().toISOString().split('T')[0],
      model: '',
      serialNumber: ''
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteDrone = (id) => {
    setDrones(drones.filter(drone => drone.id !== id));
  };

  // Filter drones based on active tab and search term
  const filteredDrones = drones.filter(drone => {
    // First filter by tab
    const matchesTab = 
      tabValue === 0 || // "All Drones" tab
      (tabValue === 1 && drone.status === 'available') ||
      (tabValue === 2 && drone.status === 'deployed') ||
      (tabValue === 3 && drone.status === 'maintenance');
    
    // Then filter by search term if present
    const matchesSearch = 
      !searchTerm || 
      drone.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Helper to get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'deployed': return 'primary';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' } 
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fleet Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your drone fleet efficiently
          </Typography>
        </Box>
        {!showAddDrone && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddDrone}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              ':hover': {
                boxShadow: '0 6px 20px 0 rgba(25, 118, 210, 0.5)',
                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            Add Drone
          </Button>
        )}
      </Box>

      {showAddDrone ? (
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DroneIcon />
              {editingDroneId !== null ? 'Edit Drone' : 'Add New Drone'}
            </Typography>
            <IconButton onClick={handleCancelAdd} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                  Basic Information
                </Typography>
                
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Drone Name"
                  name="name"
                  variant="outlined"
                  value={droneFormData.name}
                  onChange={handleInputChange}
                  autoFocus
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    id="model"
                    label="Drone Model"
                    name="model"
                    variant="outlined"
                    value={droneFormData.model}
                    onChange={handleInputChange}
                  />
                  
                  <TextField
                    fullWidth
                    id="serialNumber"
                    label="Serial Number"
                    name="serialNumber"
                    variant="outlined"
                    value={droneFormData.serialNumber}
                    onChange={handleInputChange}
                  />
                </Box>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={droneFormData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="available">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" label="●" sx={{ bgcolor: 'success.main', color: 'success.main', mr: 1, width: 8, height: 8 }} />
                        Available
                      </Box>
                    </MenuItem>
                    <MenuItem value="deployed">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" label="●" sx={{ bgcolor: 'primary.main', color: 'primary.main', mr: 1, width: 8, height: 8 }} />
                        Deployed
                      </Box>
                    </MenuItem>
                    <MenuItem value="maintenance">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip size="small" label="●" sx={{ bgcolor: 'warning.main', color: 'warning.main', mr: 1, width: 8, height: 8 }} />
                        Maintenance
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                  Technical Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Battery Level: {droneFormData.battery}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Slider
                        name="battery"
                        value={parseInt(droneFormData.battery)}
                        onChange={(e, newValue) => {
                          setDroneFormData({
                            ...droneFormData,
                            battery: newValue
                          });
                        }}
                        aria-labelledby="battery-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        min={0}
                        max={100}
                        color={
                          parseInt(droneFormData.battery) > 70 ? 'success' : 
                          parseInt(droneFormData.battery) > 30 ? 'warning' : 
                          'error'
                        }
                      />
                    </Box>
                    <TextField
                      sx={{ width: 70, ml: 2 }}
                      name="battery"
                      value={droneFormData.battery}
                      onChange={handleInputChange}
                      type="number"
                      size="small"
                      InputProps={{ 
                        inputProps: { min: 0, max: 100 },
                        endAdornment: <Typography variant="caption">%</Typography>
                      }}
                    />
                  </Box>
                </Box>
                
                <TextField
                  fullWidth
                  id="lastMaintenance"
                  label="Last Maintenance Date"
                  name="lastMaintenance"
                  type="date"
                  value={droneFormData.lastMaintenance}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mb: 2 }}
                />
                
                {droneFormData.status === 'maintenance' && (
                  <TextField
                    fullWidth
                    id="maintenanceNotes"
                    label="Maintenance Notes"
                    name="maintenanceNotes"
                    multiline
                    rows={3}
                    value={droneFormData.maintenanceNotes || ''}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                onClick={handleCancelAdd}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={editingDroneId !== null ? <EditIcon /> : <SaveIcon />}
                disabled={!droneFormData.name}
                sx={{ px: 4 }}
              >
                {editingDroneId !== null ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="fleet management tabs"
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Tab label={`All Drones (${drones.length})`} />
                <Tab label={`Available (${drones.filter(d => d.status === 'available').length})`} />
                <Tab label={`Deployed (${drones.filter(d => d.status === 'deployed').length})`} />
                <Tab label={`Maintenance (${drones.filter(d => d.status === 'maintenance').length})`} />
              </Tabs>
              
              <TextField
                sx={{ width: { xs: '100%', sm: 250 } }}
                size="small"
                placeholder="Search drones..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Box>
          </Paper>

          {filteredDrones.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
              <Table sx={{ minWidth: 650 }} aria-label="drone fleet table">
                <TableHead sx={{ bgcolor: 'background.highlight' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Battery</TableCell>
                    <TableCell>Last Maintenance</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDrones.map((drone) => (
                    <TableRow
                      key={drone.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 }, 
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleEditDrone(drone.id)}
                    >
                      <TableCell component="th" scope="row">
                        <Chip 
                          label={`#${drone.id}`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ 
                            fontWeight: 'medium',
                            bgcolor: 'background.paper',
                            borderColor: 'divider'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: `${getStatusColor(drone.status)}.light`, 
                              color: `${getStatusColor(drone.status)}.dark` 
                            }}
                          >
                            <DroneIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {drone.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {drone.model || 'No model specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={drone.status.charAt(0).toUpperCase() + drone.status.slice(1)} 
                          color={getStatusColor(drone.status)}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={drone.battery} 
                              color={
                                drone.battery > 70 ? 'success' : 
                                drone.battery > 30 ? 'warning' : 
                                'error'
                              }
                              sx={{ 
                                height: 8, 
                                borderRadius: 1,
                                [`& .MuiLinearProgress-bar`]: {
                                  transition: 'transform 1s ease-in-out'
                                }
                              }}
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontWeight: 'medium',
                              minWidth: '40px'
                            }}
                          >
                            {drone.battery}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2">{drone.lastMaintenance}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {drone.serialNumber || 'No S/N'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            aria-label="edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDrone(drone.id);
                            }}
                            sx={{ 
                              bgcolor: 'primary.lighter',
                              '&:hover': {
                                bgcolor: 'primary.light',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            aria-label="delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDrone(drone.id);
                            }}
                            sx={{ 
                              bgcolor: 'error.lighter',
                              '&:hover': {
                                bgcolor: 'error.light',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card sx={{ textAlign: 'center', p: 4, borderRadius: 2 }}>
              <CardContent>
                <DroneIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No drones found</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  No drones match the current filter or search criteria.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddDrone}
                  sx={{ mt: 2 }}
                >
                  Add your first drone
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
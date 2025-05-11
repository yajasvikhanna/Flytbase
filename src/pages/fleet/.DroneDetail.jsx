import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Battery90 as BatteryIcon,
  Speed as SpeedIcon,
  FlightTakeoff as FlightIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Router as SignalIcon
} from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineContent, TimelineSeparator, TimelineDot, TimelineConnector } from '@mui/lab';
import { Line } from 'recharts';
import { useDroneMission } from '../../contexts/DroneMissionContext';
import DroneStatusIndicator from '../../components/fleet/DroneStatusIndicator';
import DroneForm from '../../components/fleet/DroneForm';
import StatsCard from '../../components/common/StatsCard';
import TabPanel from '../../components/common/TabPanel';
import BatteryChart from '../../components/fleet/BatteryChart';
import MaintenanceCard from '../../components/fleet/MaintenanceCard';
import MissionHistoryTable from '../../components/fleet/MissionHistoryTable';

export default function DroneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDrone, updateDrone, deleteDrone, loading } = useDroneMission();
  const [drone, setDrone] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  useEffect(() => {
    const fetchDroneData = async () => {
      try {
        const data = await getDrone(id);
        setDrone(data);
      } catch (error) {
        console.error("Error fetching drone details:", error);
      }
    };
    
    fetchDroneData();
  }, [id, getDrone]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleUpdateDrone = async (droneData) => {
    try {
      await updateDrone({ ...droneData, _id: id });
      setOpenEditDialog(false);
      // Refresh drone data
      const updatedDrone = await getDrone(id);
      setDrone(updatedDrone);
    } catch (error) {
      console.error("Error updating drone:", error);
    }
  };
  
  const handleDeleteDrone = async () => {
    try {
      await deleteDrone(id);
      navigate('/fleet');
    } catch (error) {
      console.error("Error deleting drone:", error);
    }
  };
  
  if (loading || !drone) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Simulated mission history data - in a real application, this would come from your API
  const missionHistory = [
    { 
      id: 'ms1', 
      name: 'South Campus Inspection', 
      date: '2025-05-01', 
      duration: '42 minutes', 
      status: 'completed',
      surveyCoverage: '98%'
    },
    { 
      id: 'ms2', 
      name: 'North Tower Survey', 
      date: '2025-04-28', 
      duration: '27 minutes', 
      status: 'completed',
      surveyCoverage: '95%'
    },
    { 
      id: 'ms3', 
      name: 'Perimeter Security Check', 
      date: '2025-04-25', 
      duration: '39 minutes', 
      status: 'completed',
      surveyCoverage: '100%'
    },
    { 
      id: 'ms4', 
      name: 'Solar Panel Inspection', 
      date: '2025-04-22', 
      duration: '56 minutes', 
      status: 'completed',
      surveyCoverage: '97%'
    },
    { 
      id: 'ms5', 
      name: 'Emergency Response Drill', 
      date: '2025-04-20', 
      duration: '18 minutes', 
      status: 'aborted',
      surveyCoverage: '45%'
    }
  ];
  
  // Simulated maintenance history
  const maintenanceHistory = [
    {
      id: 'maint1',
      type: 'Routine Check',
      date: '2025-04-15',
      technician: 'Sarah Johnson',
      notes: 'All systems functioning normally. Replaced propeller guards.'
    },
    {
      id: 'maint2',
      type: 'Battery Replacement',
      date: '2025-03-22',
      technician: 'Mike Chen',
      notes: 'Replaced primary battery pack due to reduced capacity. Flight time improved by 22%.'
    },
    {
      id: 'maint3',
      type: 'Firmware Update',
      date: '2025-03-10',
      technician: 'Alex Wong',
      notes: 'Updated to firmware v3.8.2. Improved obstacle avoidance algorithms.'
    },
    {
      id: 'maint4',
      type: 'Sensor Calibration',
      date: '2025-02-28',
      technician: 'Sarah Johnson',
      notes: 'Recalibrated all sensors. Fixed minor drift in altimeter readings.'
    }
  ];
  
  // Simulated battery history data for the chart
  const batteryData = [
    { date: '2025-05-01', level: 100 },
    { date: '2025-05-02', level: 85 },
    { date: '2025-05-03', level: 72 },
    { date: '2025-05-04', level: 58 },
    { date: '2025-05-05', level: 46 },
    { date: '2025-05-06', level: 33 },
    { date: '2025-05-07', level: 20 },
    { date: '2025-05-08', level: 12 },
    { date: '2025-05-09', level: 95 },
    { date: '2025-05-10', level: drone.batteryLevel }
  ];
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to="/fleet"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Fleet
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            {drone.name}
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditDialog(true)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={drone.imageUrl || '/drone-placeholder.png'}
                  alt={drone.model}
                  sx={{ width: '100%', maxWidth: 240, height: 'auto', mb: 2 }}
                />
                <DroneStatusIndicator status={drone.status} size="large" />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Model
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {drone.model}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Serial Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {drone.serialNumber}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {drone.currentLocation?.name || 'Unknown'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Last Mission
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {drone.lastMission ? new Date(drone.lastMission).toLocaleDateString() : 'Never'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Battery Level"
                value={`${drone.batteryLevel}%`}
                icon={<BatteryIcon />}
                color={
                  drone.batteryLevel > 60 ? 'success' :
                  drone.batteryLevel > 30 ? 'warning' : 'error'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Flight Hours"
                value={`${drone.flightHours || 0} hours`}
                icon={<FlightIcon />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Max Speed"
                value={`${drone.specifications?.maxSpeed || 0} km/h`}
                icon={<SpeedIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Signal Strength"
                value={`${drone.telemetry?.signalStrength || 0}%`}
                icon={<SignalIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Next Maintenance"
                value={drone.nextMaintenance ? new Date(drone.nextMaintenance).toLocaleDateString() : 'Not Scheduled'}
                icon={<BuildIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Mission Count"
                value={drone.missionCount || 0}
                icon={<ScheduleIcon />}
                color="secondary"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Battery History
                  </Typography>
                  <BatteryChart data={batteryData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="drone detail tabs">
            <Tab label="Mission History" />
            <Tab label="Maintenance Log" />
            <Tab label="Specifications" />
            <Tab label="Health Status" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <MissionHistoryTable missions={missionHistory} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {maintenanceHistory.map((maintenance) => (
              <Grid item xs={12} md={6} key={maintenance.id}>
                <MaintenanceCard maintenance={maintenance} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technical Specifications
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.dimensions || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Weight
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.weight ? `${drone.specifications.weight} kg` : 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Flight Time
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.maxFlightTime ? `${drone.specifications.maxFlightTime} minutes` : 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Speed
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.maxSpeed ? `${drone.specifications.maxSpeed} km/h` : 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Altitude
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.maxAltitude ? `${drone.specifications.maxAltitude} meters` : 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Camera Resolution
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.cameraResolution || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Operating Temperature
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.operatingTemperature || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Communication Range
                  </Typography>
                  <Typography variant="body1">
                    {drone.specifications?.commRange ? `${drone.specifications.commRange} km` : 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Health Status
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      System Diagnostics
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label="Flight Controller" 
                        color="success" 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">Operational</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label="GPS Module" 
                        color="success" 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">Operational</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label="Camera System" 
                        color="success" 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">Operational</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label="Battery Health" 
                        color="warning" 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">89% Capacity (Replace soon)</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label="Motors" 
                        color="success" 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">All operational</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label="Communication System" 
                        color="success" 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2">Operational</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Alerts & Warnings
                    </Typography>
                    
                    <Timeline position="alternate">
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="warning" variant="outlined">
                            <WarningIcon />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" color="text.secondary">
                            2025-05-08
                          </Typography>
                          <Typography variant="body1">
                            Battery capacity below 90%, consider replacement
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="error" variant="outlined">
                            <WarningIcon />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" color="text.secondary">
                            2025-05-04
                          </Typography>
                          <Typography variant="body1">
                            GPS signal lost during mission
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="warning" variant="outlined">
                            <WarningIcon />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" color="text.secondary">
                            2025-04-29
                          </Typography>
                          <Typography variant="body1">
                            Motor #3 temperature above normal
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="warning" variant="outlined">
                            <WarningIcon />
                          </TimelineDot>
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" color="text.secondary">
                            2025-04-22
                          </Typography>
                          <Typography variant="body1">
                            Firmware update available
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    </Timeline>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Edit Drone Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Drone</DialogTitle>
        <DialogContent>
          <DroneForm drone={drone} onSubmit={handleUpdateDrone} />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete drone "{drone.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteDrone} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
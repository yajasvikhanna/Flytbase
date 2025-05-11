import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  DoNotDisturb as AbortedIcon,
  PlayCircle as ActiveIcon,
  Pause as PausedIcon,
  FlightTakeoff as DroneIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Assessment as ReportIcon,
  PlayArrow as StartIcon,
  Stop as AbortIcon,
  LowPriority as PriorityIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';
import MapView from '../../components/maps/MapView';

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getMission, 
    deleteMission, 
    controlMission, 
    generateReport,
    loading 
  } = useDroneMission();
  
  const [mission, setMission] = useState(null);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [controlAction, setControlAction] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  
  // Fetch mission data
  useEffect(() => {
    const fetchMission = async () => {
      try {
        const missionData = await getMission(id);
        setMission(missionData);
      } catch (err) {
        setError('Failed to fetch mission details');
        console.error(err);
      }
    };
    
    fetchMission();
  }, [id, getMission]);
  
  // Handle delete mission
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteMission(mission._id);
      setDeleteDialogOpen(false);
      navigate('/missions');
    } catch (err) {
      setError('Failed to delete mission');
      console.error(err);
    }
  };
  
  // Handle mission control
  const handleControlClick = (action) => {
    setControlAction(action);
    setControlDialogOpen(true);
  };
  
  const handleControlConfirm = async () => {
    try {
      await controlMission(mission._id, controlAction);
      
      // Update local mission status
      const updatedMission = await getMission(id);
      setMission(updatedMission);
      
      setControlDialogOpen(false);
    } catch (err) {
      setError(`Failed to ${controlAction} mission`);
      console.error(err);
    }
  };
  
  // Handle report generation
  const handleReportClick = () => {
    setReportDialogOpen(true);
  };
  
  const handleReportConfirm = async () => {
    try {
      setReportGenerating(true);
      await generateReport(mission._id);
      setReportDialogOpen(false);
      setReportGenerating(false);
      navigate('/reports');
    } catch (err) {
      setError('Failed to generate report');
      setReportGenerating(false);
      console.error(err);
    }
  };
  
  // Helper function to get status chip
  const renderStatusChip = (status) => {
    switch(status) {
      case 'completed':
        return <Chip 
          icon={<CompletedIcon />} 
          label="Completed" 
          color="success" 
          size="small" 
          variant="outlined" 
        />;
      case 'in-progress':
        return <Chip 
          icon={<ActiveIcon />} 
          label="Active" 
          color="info" 
          size="small" 
          variant="outlined" 
        />;
      case 'aborted':
        return <Chip 
          icon={<AbortedIcon />} 
          label="Aborted" 
          color="error" 
          size="small" 
          variant="outlined" 
        />;
      case 'paused':
        return <Chip 
          icon={<PausedIcon />} 
          label="Paused" 
          color="warning" 
          size="small" 
          variant="outlined" 
        />;
      default:
        return <Chip 
          label={status} 
          size="small" 
          variant="outlined" 
        />;
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/missions')}
        >
          Back to Missions
        </Button>
      </Box>
    );
  }
  
  if (!mission) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">Loading mission details...</Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
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
          <Typography variant="h4">Mission Details</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {mission.status !== 'completed' && mission.status !== 'aborted' && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/missions/edit/${mission._id}`)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            disabled={mission.status === 'in-progress'}
          >
            Delete
          </Button>
        </Stack>
      </Box>
      
      {/* Mission Details */}
      <Grid container spacing={3}>
        {/* Mission Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              {mission.name} {renderStatusChip(mission.status)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <DroneIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Drone"
                  secondary={mission.drone?.name || mission.drone}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Survey Type"
                  secondary={mission.surveyType}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PriorityIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Priority"
                  secondary={mission.priority}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DateIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Date Range"
                  secondary={`${formatDate(mission.startDate)} - ${formatDate(mission.endDate)}`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <TimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Duration"
                  secondary={mission.estimatedDuration ? `${mission.estimatedDuration} minutes` : 'Not specified'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Description"
                  secondary={mission.description || 'No description provided'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Map View */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Survey Area</Typography>
            <Box sx={{ height: 400, mb: 2 }}>
              {mission.coordinates && (
                <MapView 
                  center={mission.coordinates.center}
                  boundary={mission.coordinates.boundary}
                  flightPath={mission.coordinates.flightPath}
                  readOnly={true}
                />
              )}
              {!mission.coordinates && (
                <Alert severity="info">No map coordinates available for this mission</Alert>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Mission Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Mission Controls</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Mission Status
                    </Typography>
                    <Typography variant="h5" component="div">
                      {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={9}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Actions
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {/* Control buttons based on status */}
                      {mission.status === 'in-progress' && (
                        <>
                          <Button
                            variant="contained"
                            color="warning"
                            startIcon={<PausedIcon />}
                            onClick={() => handleControlClick('pause')}
                          >
                            Pause Mission
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CompletedIcon />}
                            onClick={() => handleControlClick('complete')}
                          >
                            Complete Mission
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<AbortIcon />}
                            onClick={() => handleControlClick('abort')}
                          >
                            Abort Mission
                          </Button>
                        </>
                      )}
                      {mission.status === 'paused' && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<StartIcon />}
                            onClick={() => handleControlClick('resume')}
                          >
                            Resume Mission
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<AbortIcon />}
                            onClick={() => handleControlClick('abort')}
                          >
                            Abort Mission
                          </Button>
                        </>
                      )}
                      {mission.status === 'completed' && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<ReportIcon />}
                          onClick={handleReportClick}
                        >
                          Generate Report
                        </Button>
                      )}
                      {mission.status !== 'in-progress' && mission.status !== 'paused' && mission.status !== 'completed' && (
                        <Typography variant="body1">
                          No actions available for this mission status
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Mission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the mission "{mission.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Control Confirmation Dialog */}
      <Dialog
        open={controlDialogOpen}
        onClose={() => setControlDialogOpen(false)}
      >
        <DialogTitle>{controlAction?.charAt(0).toUpperCase() + controlAction?.slice(1)} Mission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {controlAction} the mission "{mission.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setControlDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleControlConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Generation Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => !reportGenerating && setReportDialogOpen(false)}
      >
        <DialogTitle>Generate Mission Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Generate a comprehensive report for the mission "{mission.name}"?
            This will analyze all collected data and create a detailed summary.
          </DialogContentText>
          {reportGenerating && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setReportDialogOpen(false)} 
            color="primary"
            disabled={reportGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReportConfirm} 
            color="primary" 
            variant="contained"
            disabled={reportGenerating}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
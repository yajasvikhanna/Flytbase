import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  FlightTakeoff as FlightIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDroneMission } from '../../contexts/DroneMissionContext';

export default function ActiveMissions() {
  const { getMissions, updateMissionStatus } = useDroneMission();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMission, setSelectedMission] = useState(null);

  useEffect(() => {
    const fetchActiveMissions = async () => {
      try {
        setLoading(true);
        const data = await getMissions({ status: ['in-progress', 'paused'] });
        setMissions(data);
        setError('');
      } catch (err) {
        setError('Failed to load active missions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveMissions();
  }, [getMissions]);

  const handleStatusChange = async (missionId, newStatus) => {
    try {
      await updateMissionStatus(missionId, newStatus);
      setMissions(prevMissions =>
        prevMissions.map(mission =>
          mission._id === missionId ? { ...mission, status: newStatus } : mission
        )
      );
    } catch (err) {
      console.error('Error updating mission status:', err);
      setError(`Failed to update mission status: ${err.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-progress':
        return <FlightIcon color="success" />;
      case 'paused':
        return <PauseIcon color="warning" />;
      default:
        return null;
    }
  };

  const handleOpenMap = (mission) => {
    setSelectedMission(mission);
  };

  const handleCloseMap = () => {
    setSelectedMission(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Active Missions
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {missions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="textSecondary">
            No active missions found
          </Typography>
          <Button
            component={RouterLink}
            to="/missions/new"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Create New Mission
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {missions.map((mission) => (
            <Grid item xs={12} md={6} key={mission._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{mission.name}</Typography>
                    <Chip
                      icon={getStatusIcon(mission.status)}
                      label={mission.status === 'in-progress' ? 'In Progress' : 'Paused'}
                      color={mission.status === 'in-progress' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Drone: {mission.drone?.name || 'Not assigned'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Survey Area: {mission.surveyArea?.toFixed(2)} m²
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Progress:
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={mission.progress || 0} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(mission.progress || 0)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/missions/${mission._id}`}
                  >
                    View Details
                  </Button>

                  {mission.status === 'in-progress' ? (
                    <Button
                      size="small"
                      startIcon={<PauseIcon />}
                      onClick={() => handleStatusChange(mission._id, 'paused')}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleStatusChange(mission._id, 'in-progress')}
                    >
                      Resume
                    </Button>
                  )}

                  <Button
                    size="small"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={() => handleStatusChange(mission._id, 'completed')}
                  >
                    Complete
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenMap(mission)}
                  >
                    Track Drone
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Map Dialog */}
      {selectedMission && (
        <Dialog open={!!selectedMission} onClose={handleCloseMap} fullWidth maxWidth="md">
          <DialogTitle>
            Tracking: {selectedMission.name}
            <IconButton
              aria-label="close"
              onClick={handleCloseMap}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <MapContainer
              center={[
                selectedMission.currentLat || 28.6448,
                selectedMission.currentLng || 77.216721
              ]}
              zoom={15}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[
                  selectedMission.currentLat || 28.6448,
                  selectedMission.currentLng || 77.216721
                ]}
              />
              <Circle
                center={[
                  selectedMission.geofenceLat || 28.6448,
                  selectedMission.geofenceLng || 77.216721
                ]}
                radius={selectedMission.geofenceRadius || 300}
                pathOptions={{ color: 'red', fillOpacity: 0.1 }}
              />
            </MapContainer>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}

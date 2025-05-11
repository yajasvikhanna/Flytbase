import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Chip, Grid, LinearProgress } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDroneMission } from '../../contexts/DroneMissionContext';

export default function ActiveMissionMap({ mission }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef([]);
  const { socket } = useDroneMission();
  
  const [telemetry, setTelemetry] = useState({
    altitude: 0,
    speed: 0,
    batteryLevel: 100,
    signalStrength: 100,
    latitude: 0,
    longitude: 0,
    heading: 0
  });
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [mission.geofence.coordinates[0][0][0], mission.geofence.coordinates[0][0][1]],
      zoom: 15
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
    
    map.current.on('load', () => {
      // Add the geofence layer
      map.current.addSource('geofence', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: mission.geofence
        }
      });
      
      map.current.addLayer({
        id: 'geofence-fill',
        type: 'fill',
        source: 'geofence',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.1
        }
      });
      
      map.current.addLayer({
        id: 'geofence-line',
        type: 'line',
        source: 'geofence',
        paint: {
          'line-color': '#0080ff',
          'line-width': 2
        }
      });
      
      // Add the drone path layer
      map.current.addSource('drone-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      
      map.current.addLayer({
        id: 'drone-path',
        type: 'line',
        source: 'drone-path',
        paint: {
          'line-color': '#ff3300',
          'line-width': 3
        }
      });
      
      // Create drone marker
      const el = document.createElement('div');
      el.className = 'drone-marker';
      el.style.backgroundImage = `url(${'/drone-icon.svg'})`;
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundSize = '100%';
      el.style.transform = 'rotate(0deg)';
      
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([mission.geofence.coordinates[0][0][0], mission.geofence.coordinates[0][0][1]])
        .addTo(map.current);
    });
    
    return () => map.current.remove();
  }, [mission]);
  
  // Handle socket events for drone telemetry
  useEffect(() => {
    if (!socket || !mission) return;
    
    const handleTelemetry = (data) => {
      if (data.missionId === mission._id) {
        // Update telemetry state
        setTelemetry(data);
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLngLat([data.longitude, data.latitude]);
          
          // Update marker rotation based on heading
          const markerEl = markerRef.current.getElement();
          markerEl.style.transform = `rotate(${data.heading}deg)`;
        }
        
        // Update path
        if (map.current && map.current.isStyleLoaded()) {
          pathRef.current.push([data.longitude, data.latitude]);
          
          const source = map.current.getSource('drone-path');
          if (source) {
            source.setData({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: pathRef.current
              }
            });
          }
          
          // Center map on drone if it's going out of view
          const bounds = map.current.getBounds();
          if (
            data.longitude < bounds._sw.lng || 
            data.longitude > bounds._ne.lng || 
            data.latitude < bounds._sw.lat || 
            data.latitude > bounds._ne.lat
          ) {
            map.current.easeTo({
              center: [data.longitude, data.latitude],
              duration: 1000
            });
          }
        }
      }
    };
    
    socket.on('droneTelemetry', handleTelemetry);
    
    return () => {
      socket.off('droneTelemetry', handleTelemetry);
    };
  }, [socket, mission]);
  
  const batteryColor = () => {
    if (telemetry.batteryLevel > 70) return 'success';
    if (telemetry.batteryLevel > 30) return 'warning';
    return 'error';
  };
  
  const signalColor = () => {
    if (telemetry.signalStrength > 70) return 'success';
    if (telemetry.signalStrength > 30) return 'warning';
    return 'error';
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        ref={mapContainer} 
        sx={{ 
          flexGrow: 1, 
          minHeight: '500px'
        }} 
      />
      
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">Altitude</Typography>
            <Typography variant="h6">{telemetry.altitude.toFixed(1)} m</Typography>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">Speed</Typography>
            <Typography variant="h6">{telemetry.speed.toFixed(1)} km/h</Typography>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">Battery</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={telemetry.batteryLevel} 
                  color={batteryColor()}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {telemetry.batteryLevel}%
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">Signal</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={telemetry.signalStrength} 
                  color={signalColor()}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {telemetry.signalStrength}%
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Location: {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)} | Heading: {telemetry.heading}°
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
};
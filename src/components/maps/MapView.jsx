import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Delete as DeleteIcon } from '@mui/icons-material';

// This would normally be set via environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token';

export default function MapView({ 
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  boundary = [],
  flightPath = [],
  onChange,
  readOnly = false 
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapError, setMapError] = useState(null);
  
  // Keep track of drawing state inside the component
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingType, setDrawingType] = useState(null); // 'boundary' or 'path'
  const currentPath = useRef([]);
  
  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [center.lng, center.lat],
        zoom: 12
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());
      
      // Wait for map to load before setting up event handlers
      map.current.on('load', () => {
        // Render existing data if any
        renderBoundaryAndPath();
        
        // Set up map click handler for drawing
        if (!readOnly) {
          map.current.on('click', handleMapClick);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please check your connection and try again.");
    }
    
    return () => {
      // Clean up on unmount
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, []);
  
  // Update map when boundary or flight path changes from props
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    renderBoundaryAndPath();
  }, [boundary, flightPath]);
  
  // Handle map clicks for drawing
  const handleMapClick = useCallback((e) => {
    if (!isDrawing) return;
    
    const coord = [e.lngLat.lng, e.lngLat.lat];
    currentPath.current = [...currentPath.current, coord];
    
    // Update the visual representation
    renderPreview();
  }, [isDrawing]);
  
  // Render the boundary and flight path on the map
  const renderBoundaryAndPath = useCallback(() => {
    if (!map.current || !map.current.loaded()) return;
    
    // Clear existing layers
    if (map.current.getLayer('boundary-fill')) map.current.removeLayer('boundary-fill');
    if (map.current.getLayer('boundary-outline')) map.current.removeLayer('boundary-outline');
    if (map.current.getLayer('flight-path')) map.current.removeLayer('flight-path');
    if (map.current.getLayer('waypoints')) map.current.removeLayer('waypoints');
    
    if (map.current.getSource('boundary')) map.current.removeSource('boundary');
    if (map.current.getSource('flight-path')) map.current.removeSource('flight-path');
    if (map.current.getSource('waypoints')) map.current.removeSource('waypoints');
    
    // Only continue if we have data to render
    if (boundary.length === 0 && flightPath.length === 0) return;
    
    // Render boundary if it exists
    if (boundary.length > 0) {
      try {
        map.current.addSource('boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [boundary]
            }
          }
        });
        
        map.current.addLayer({
          id: 'boundary-fill',
          type: 'fill',
          source: 'boundary',
          paint: {
            'fill-color': '#3f51b5',
            'fill-opacity': 0.2
          }
        });
        
        map.current.addLayer({
          id: 'boundary-outline',
          type: 'line',
          source: 'boundary',
          paint: {
            'line-color': '#3f51b5',
            'line-width': 2
          }
        });
      } catch (error) {
        console.error("Error rendering boundary:", error);
      }
    }
    
    // Render flight path if it exists
    if (flightPath.length > 0) {
      try {
        map.current.addSource('flight-path', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: flightPath
            }
          }
        });
        
        map.current.addLayer({
          id: 'flight-path',
          type: 'line',
          source: 'flight-path',
          paint: {
            'line-color': '#ff4081',
            'line-width': 3,
            'line-dasharray': [2, 1]
          }
        });
        
        // Add waypoints
        map.current.addSource('waypoints', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: flightPath.map((point, index) => ({
              type: 'Feature',
              properties: {
                index: index
              },
              geometry: {
                type: 'Point',
                coordinates: point
              }
            }))
          }
        });
        
        map.current.addLayer({
          id: 'waypoints',
          type: 'circle',
          source: 'waypoints',
          paint: {
            'circle-radius': 5,
            'circle-color': '#ff4081',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        });
      } catch (error) {
        console.error("Error rendering flight path:", error);
      }
    }
  }, [boundary, flightPath]);
  
  // Render the preview while drawing
  const renderPreview = useCallback(() => {
    if (!map.current || currentPath.current.length === 0) return;
    
    // Clear existing preview
    if (map.current.getLayer('preview-line')) map.current.removeLayer('preview-line');
    if (map.current.getLayer('preview-points')) map.current.removeLayer('preview-points');
    if (map.current.getSource('preview-line')) map.current.removeSource('preview-line');
    if (map.current.getSource('preview-points')) map.current.removeSource('preview-points');
    
    try {
      // Add preview line
      map.current.addSource('preview-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: drawingType === 'boundary' ? 'Polygon' : 'LineString',
            coordinates: drawingType === 'boundary' 
              ? [currentPath.current.length > 2 ? [...currentPath.current, currentPath.current[0]] : currentPath.current] 
              : currentPath.current
          }
        }
      });
      
      map.current.addLayer({
        id: 'preview-line',
        type: 'line',
        source: 'preview-line',
        paint: {
          'line-color': '#ff9800',
          'line-width': 2,
          'line-dasharray': [2, 1]
        }
      });
      
      // Add preview points
      map.current.addSource('preview-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: currentPath.current.map((point, index) => ({
            type: 'Feature',
            properties: {
              index: index
            },
            geometry: {
              type: 'Point',
              coordinates: point
            }
          }))
        }
      });
      
      map.current.addLayer({
        id: 'preview-points',
        type: 'circle',
        source: 'preview-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ff9800',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });
    } catch (error) {
      console.error("Error rendering preview:", error);
    }
  }, [drawingType]);
  
  // Drawing action functions
  const startDrawingBoundary = useCallback(() => {
    setMapError(null);
    setIsDrawing(true);
    setDrawingType('boundary');
    currentPath.current = [];
    if (map.current) {
      map.current.getCanvas().style.cursor = 'crosshair';
      
      // Clear existing preview
      if (map.current.getLayer('preview-line')) map.current.removeLayer('preview-line');
      if (map.current.getLayer('preview-points')) map.current.removeLayer('preview-points');
      if (map.current.getSource('preview-line')) map.current.removeSource('preview-line');
      if (map.current.getSource('preview-points')) map.current.removeSource('preview-points');
    }
  }, []);
  
  const startDrawingPath = useCallback(() => {
    setMapError(null);
    setIsDrawing(true);
    setDrawingType('path');
    currentPath.current = [];
    if (map.current) {
      map.current.getCanvas().style.cursor = 'crosshair';
      
      // Clear existing preview
      if (map.current.getLayer('preview-line')) map.current.removeLayer('preview-line');
      if (map.current.getLayer('preview-points')) map.current.removeLayer('preview-points');
      if (map.current.getSource('preview-line')) map.current.removeSource('preview-line');
      if (map.current.getSource('preview-points')) map.current.removeSource('preview-points');
    }
  }, []);
  
  const finishDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
    
    if (drawingType === 'boundary') {
      // Close the polygon
      if (currentPath.current.length > 2) {
        // Make sure the boundary is closed
        const closedPath = [...currentPath.current];
        if (closedPath[0][0] !== closedPath[closedPath.length - 1][0] || 
            closedPath[0][1] !== closedPath[closedPath.length - 1][1]) {
          closedPath.push(closedPath[0]); // Close the loop
        }
        onChange({ boundary: closedPath });
      } else {
        setMapError("Need at least 3 points to create a boundary");
      }
    } else if (drawingType === 'path') {
      if (currentPath.current.length > 1) {
        onChange({ flightPath: currentPath.current });
      } else {
        setMapError("Need at least 2 points to create a path");
      }
    }
    
    setDrawingType(null);
    
    // Clear preview
    if (map.current) {
      if (map.current.getLayer('preview-line')) map.current.removeLayer('preview-line');
      if (map.current.getLayer('preview-points')) map.current.removeLayer('preview-points');
      if (map.current.getSource('preview-line')) map.current.removeSource('preview-line');
      if (map.current.getSource('preview-points')) map.current.removeSource('preview-points');
    }
  }, [isDrawing, drawingType, onChange]);
  
  // Clear all drawings
  const clearAll = useCallback(() => {
    onChange({ boundary: [], flightPath: [] });
    setMapError(null);
  }, [onChange]);
  
  // Generate flight path patterns
  const generatePattern = useCallback((type) => {
    setMapError(null);
    
    if (!boundary || boundary.length === 0) {
      setMapError("Please draw a boundary first");
      return;
    }
    
    // Make sure we have a valid boundary (at least 3 points)
    if (boundary.length < 3) {
      setMapError("Boundary needs at least 3 points");
      return;
    }
    
    // Calculate boundary extents
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    boundary.forEach(point => {
      minLng = Math.min(minLng, point[0]);
      maxLng = Math.max(maxLng, point[0]);
      minLat = Math.min(minLat, point[1]);
      maxLat = Math.max(maxLat, point[1]);
    });
    
    // Calculate centroid
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    // Calculate dimensions
    const width = maxLng - minLng;
    const height = maxLat - minLat;
    
    let newPath = [];
    
    // Generate pattern based on type
    if (type === 'grid') {
      // Create a grid pattern
      const spacing = Math.min(width, height) / 10; // Adjust for desired grid density
      const numLines = Math.ceil(height / spacing) + 1;
      
      let goingRight = true;
      
      for (let i = 0; i < numLines; i++) {
        const y = minLat + (i * spacing);
        
        if (y > maxLat) continue;
        
        if (goingRight) {
          newPath.push([minLng, y]);
          newPath.push([maxLng, y]);
        } else {
          newPath.push([maxLng, y]);
          newPath.push([minLng, y]);
        }
        
        goingRight = !goingRight;
      }
    } else if (type === 'crosshatch') {
      // Create a crosshatch pattern (grid + diagonal)
      // First create horizontal lines
      const spacing = Math.min(width, height) / 5; // Wider spacing for crosshatch
      const numLines = Math.ceil(height / spacing) + 1;
      
      for (let i = 0; i < numLines; i++) {
        const y = minLat + (i * spacing);
        
        if (y > maxLat) continue;
        
        newPath.push([minLng, y]);
        newPath.push([maxLng, y]);
      }
      
      // Then create vertical lines
      const numVertLines = Math.ceil(width / spacing) + 1;
      
      for (let i = 0; i < numVertLines; i++) {
        const x = minLng + (i * spacing);
        
        if (x > maxLng) continue;
        
        newPath.push([x, minLat]);
        newPath.push([x, maxLat]);
      }
    } else if (type === 'perimeter') {
      // Use the boundary itself as the path
      // Make sure to remove the last point if it's the same as the first (closing point)
      if (boundary.length > 0) {
        if (boundary[0][0] === boundary[boundary.length - 1][0] && 
            boundary[0][1] === boundary[boundary.length - 1][1]) {
          newPath = boundary.slice(0, -1);
        } else {
          newPath = [...boundary];
        }
      }
    } else if (type === 'spiral') {
      // Create a spiral pattern
      const turns = 5;
      const pointsPerTurn = 20;
      const totalPoints = turns * pointsPerTurn;
      const maxRadius = Math.min(width, height) / 2;
      
      for (let i = 0; i < totalPoints; i++) {
        const angle = (i / pointsPerTurn) * Math.PI * 2;
        const radius = ((i / totalPoints) * maxRadius);
        const x = centerLng + Math.cos(angle) * radius;
        const y = centerLat + Math.sin(angle) * radius;
        newPath.push([x, y]);
      }
    }
    
    onChange({ flightPath: newPath });
  }, [boundary, onChange]);
  
  return (
    <Box sx={{ position: 'relative', height: '500px', borderRadius: 1, overflow: 'hidden' }}>
      {mapError && (
        <Alert severity="error" sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
          {mapError}
        </Alert>
      )}
      
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {!readOnly && (
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 2, 
          backgroundColor: 'white', 
          p: 1, 
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Drawing Tools</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={startDrawingBoundary}
              disabled={isDrawing}
            >
              Draw Boundary
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={startDrawingPath}
              disabled={isDrawing}
            >
              Draw Path
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={finishDrawing}
              disabled={!isDrawing}
            >
              Finish Drawing
            </Button>
          </Box>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Path Patterns</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => generatePattern('grid')}
              disabled={isDrawing || boundary.length < 3}
            >
              Grid Pattern
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => generatePattern('crosshatch')}
              disabled={isDrawing || boundary.length < 3}
            >
              Crosshatch
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => generatePattern('perimeter')}
              disabled={isDrawing || boundary.length < 3}
            >
              Perimeter
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => generatePattern('spiral')}
              disabled={isDrawing || boundary.length < 3}
            >
              Spiral
            </Button>
          </Box>
          
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            startIcon={<DeleteIcon />}
            onClick={clearAll}
            disabled={isDrawing}
            sx={{ mt: 2 }}
          >
            Clear All
          </Button>
        </Box>
      )}
    </Box>
  );
}
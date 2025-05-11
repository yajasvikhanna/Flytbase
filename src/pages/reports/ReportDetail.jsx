import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip, 
  Divider, 
  CircularProgress, 
  Alert, 
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Link
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Download as DownloadIcon, 
  Print as PrintIcon, 
  Share as ShareIcon, 
  Description as DescriptionIcon, 
  Image as ImageIcon, 
  Map as MapIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import MapView from '../../components/maps/MapView';
import { useAuth } from '../../contexts/AuthContext';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const openMenu = Boolean(menuAnchorEl);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(response.data.data.report);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDownload = () => {
    // In a real app, this would handle report download
    handleMenuClose();
    alert('Downloading the report...');
  };

  const handlePrint = () => {
    // In a real app, this would handle report printing
    handleMenuClose();
    window.print();
  };

  const handleShare = () => {
    // In a real app, this would handle report sharing
    handleMenuClose();
    alert('Sharing the report...');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'processing':
        return <Chip label="Processing" color="primary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/reports')}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Report not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/reports')}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/reports')}
        >
          Back to Reports
        </Button>
        <Box>
          <IconButton
            aria-label="more"
            id="report-menu-button"
            aria-controls={openMenu ? 'report-menu' : undefined}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="report-menu"
            anchorEl={menuAnchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'report-menu-button',
            }}
          >
            <MenuItem onClick={handleDownload}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Download Report
            </MenuItem>
            <MenuItem onClick={handlePrint}>
              <PrintIcon fontSize="small" sx={{ mr: 1 }} />
              Print Report
            </MenuItem>
            <MenuItem onClick={handleShare}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} />
              Share Report
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {report.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusChip(report.status)}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Report ID: {report._id}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Mission
            </Typography>
            <Typography variant="body1" gutterBottom>
              {report.mission?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date Created
            </Typography>
            <Typography variant="body1" gutterBottom>
              {format(new Date(report.createdAt), 'PPP')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Created By
            </Typography>
            <Typography variant="body1" gutterBottom>
              {report.createdBy?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1" gutterBottom>
              {format(new Date(report.updatedAt), 'PPP')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
            <Tab icon={<DescriptionIcon />} iconPosition="start" label="Summary" id="report-tab-0" />
            <Tab icon={<ImageIcon />} iconPosition="start" label="Images" id="report-tab-1" />
            <Tab icon={<MapIcon />} iconPosition="start" label="Map Data" id="report-tab-2" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Executive Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {report.summary || 'No summary available for this report.'}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Key Findings
            </Typography>
            {report.findings && report.findings.length > 0 ? (
              <ul>
                {report.findings.map((finding, index) => (
                  <li key={index}>
                    <Typography variant="body1" paragraph>
                      {finding}
                    </Typography>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body1">
                No key findings recorded for this report.
              </Typography>
            )}
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Recommendations
            </Typography>
            <Typography variant="body1" paragraph>
              {report.recommendations || 'No recommendations available for this report.'}
            </Typography>
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            {report.images && report.images.length > 0 ? (
              <Grid container spacing={2}>
                {report.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      component="img"
                      sx={{
                        height: 200,
                        width: '100%',
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      src={image.url}
                      alt={image.caption || `Drone Image ${index + 1}`}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {image.caption || `Image ${index + 1}`}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  No images available for this report
                </Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            {report.geoData ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Survey Area
                </Typography>
                <Box sx={{ height: 400, mb: 3 }}>
                  <MapView 
                    readOnly={true} 
                    initialViewport={report.mission?.area?.center || { lat: 37.7749, lng: -122.4194 }}
                    polygons={report.mission?.area?.polygons || []}
                    markers={report.mission?.area?.points || []}
                  />
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Data Metrics
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Area Covered</TableCell>
                        <TableCell align="right">{report.geoData.areaCovered} sq km</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Flight Duration</TableCell>
                        <TableCell align="right">{report.geoData.flightDuration} minutes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Images Captured</TableCell>
                        <TableCell align="right">{report.geoData.imagesCaptured}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Flight Altitude</TableCell>
                        <TableCell align="right">{report.geoData.flightAltitude} meters</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Resolution</TableCell>
                        <TableCell align="right">{report.geoData.resolution} cm/pixel</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Download Map Data
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    GeoJSON
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    KML
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    Shapefile
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MapIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  No map data available for this report
                </Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
}
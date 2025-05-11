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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';

export default function Reports() {
  const { getReports } = useDroneMission();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports();
        setReports(data);
        setError('');
      } catch (err) {
        setError('Failed to load reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [getReports]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const getReportsByType = () => {
    if (tabValue === 0) return filterReports(reports);
    return filterReports(reports.filter(report => report.type === ['survey', 'imagery', 'orthomosaic'][tabValue - 1]));
  };

  const filterReports = (reportsList) =>
    reportsList.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.missionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getReportIcon = (type) => {
    switch (type) {
      case 'survey':
        return <DescriptionIcon color="primary" />;
      case 'imagery':
        return <ImageIcon color="secondary" />;
      case 'orthomosaic':
        return <MapIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <DescriptionIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress thickness={5} size={60} />
      </Box>
    );
  }

  const displayReports = getReportsByType();

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: 'primary.main' }}>
          Mission Reports
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Search, browse, and explore detailed UAV report data.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search reports by title, mission, or location..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderRadius: 2, backgroundColor: 'background.paper', mb: 4 }}
      >
        <Tab label="All Reports" />
        <Tab label="Survey" />
        <Tab label="Imagery" />
        <Tab label="Orthomosaic" />
      </Tabs>

      {displayReports.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No reports found for your search.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {displayReports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 3,
                  background: 'linear-gradient(145deg, #1f2937, #111827)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getReportIcon(report.type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {report.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="grey.400" gutterBottom>
                    Mission: {report.missionName}
                  </Typography>
                  <Typography variant="body2" color="grey.400" gutterBottom>
                    Location: {report.location}
                  </Typography>
                  <Typography variant="body2" color="grey.400">
                    Date: {new Date(report.createdAt).toLocaleDateString()}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      color="secondary"
                      size="small"
                      variant="outlined"
                      sx={{ color: 'white', borderColor: 'white' }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/reports/${report._id}`}
                    variant="contained"
                    color="primary"
                  >
                    View Report
                  </Button>
                  <Button size="small" variant="outlined" color="secondary">
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

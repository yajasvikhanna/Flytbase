import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FlightTakeoff as FlightIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';

export default function MissionHistory() {
  const { getMissions } = useDroneMission();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMissionHistory = async () => {
      try {
        setLoading(true);
        const data = await getMissions({ status: ['completed', 'cancelled', 'failed'] });
        setMissions(data);
        setError('');
      } catch (err) {
        setError('Failed to load mission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionHistory();
  }, [getMissions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredMissions = missions.filter(mission => 
    mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mission.drone?.name && mission.drone.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip icon={<CheckIcon />} label="Completed" color="success" size="small" />;
      case 'cancelled':
        return <Chip icon={<ErrorIcon />} label="Cancelled" color="warning" size="small" />;
      case 'failed':
        return <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
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
          Mission History
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search missions..."
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

        <TableContainer>
          <Table aria-label="mission history table">
            <TableHead>
              <TableRow>
                <TableCell>Mission Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Drone</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMissions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((mission) => (
                  <TableRow key={mission._id}>
                    <TableCell component="th" scope="row">
                      {mission.name}
                    </TableCell>
                    <TableCell>
                      {new Date(mission.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{mission.drone?.name || 'N/A'}</TableCell>
                    <TableCell>{mission.location}</TableCell>
                    <TableCell>{getStatusChip(mission.status)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        to={`/missions/${mission._id}`}
                        size="small"
                        aria-label="view"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredMissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No mission history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMissions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}
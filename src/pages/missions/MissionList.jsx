import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  DoNotDisturb as AbortedIcon,
  PlayCircle as ActiveIcon,
  Pause as PausedIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';

export default function MissionList() {
  const navigate = useNavigate();
  const { missions, deleteMission, loading } = useDroneMission();
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredMissions, setFilteredMissions] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState(null);
  
  // Apply filters
  useEffect(() => {
    let result = [...missions];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(mission => 
        mission.name.toLowerCase().includes(searchLower) ||
        mission.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(mission => mission.status === filters.status);
    }
    
    setFilteredMissions(result);
  }, [missions, filters]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };
  
  const handleDeleteClick = (mission) => {
    setMissionToDelete(mission);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (missionToDelete) {
      try {
        await deleteMission(missionToDelete._id);
        setDeleteDialogOpen(false);
        setMissionToDelete(null);
      } catch (error) {
        console.error('Failed to delete mission:', error);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMissionToDelete(null);
  };
  
  // Helper function to render status chip
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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mission Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/missions/new')}
        >
          New Mission
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              name="search"
              label="Search Missions"
              variant="outlined"
              fullWidth
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="status"
              select
              label="Status"
              variant="outlined"
              fullWidth
              value={filters.status}
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="in-progress">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="aborted">Aborted</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Missions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Drone</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading missions...</TableCell>
                </TableRow>
              ) : filteredMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No missions found</TableCell>
                </TableRow>
              ) : (
                filteredMissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((mission) => (
                    <TableRow key={mission._id} hover>
                      <TableCell>{mission.name}</TableCell>
                      <TableCell>{mission.drone.name || mission.drone}</TableCell>
                      <TableCell>{formatDate(mission.startDate)}</TableCell>
                      <TableCell>
                        {mission.endDate ? formatDate(mission.endDate) : '-'}
                      </TableCell>
                      <TableCell>{renderStatusChip(mission.status)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => navigate(`/missions/${mission._id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => navigate(`/missions/edit/${mission._id}`)}
                            disabled={mission.status === 'completed' || mission.status === 'aborted'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(mission)}
                            disabled={mission.status === 'in-progress'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Mission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the mission "{missionToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
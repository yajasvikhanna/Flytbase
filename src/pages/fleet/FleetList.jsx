import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Grid,
  IconButton,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useDroneMission } from '../../contexts/DroneMissionContext';
import DroneStatusIndicator from '../../components/fleet/DroneStatusIndicator';
import DroneForm from '../../components/fleet/DroneForm';

export default function FleetList() {
  const { drones, loading, fetchDrones, addDrone, updateDrone, deleteDrone } = useDroneMission();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [droneToDelete, setDroneToDelete] = useState(null);
  const [editDrone, setEditDrone] = useState(null);
  
  useEffect(() => {
    fetchDrones();
  }, [fetchDrones]);
  
  const handleAddDrone = async (droneData) => {
    await addDrone(droneData);
    setOpenAddDialog(false);
  };
  
  const handleUpdateDrone = async (droneData) => {
    await updateDrone(droneData);
    setEditDrone(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (droneToDelete) {
      await deleteDrone(droneToDelete);
      setDroneToDelete(null);
      setOpenDeleteDialog(false);
    }
  };
  
  const filteredDrones = drones.filter(drone => {
    const matchesSearch = 
      drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || drone.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const columns = [
    { 
      field: 'name', 
      headerName: 'Drone Name', 
      flex: 1,
      renderCell: (params) => (
        <Link component={RouterLink} to={`/fleet/${params.row._id}`} underline="hover">
          {params.value}
        </Link>
      )
    },
    { field: 'model', headerName: 'Model', flex: 1 },
    { field: 'serialNumber', headerName: 'Serial Number', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => (
        <DroneStatusIndicator status={params.value} />
      )
    },
    { 
      field: 'batteryLevel', 
      headerName: 'Battery', 
      flex: 0.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress
            variant="determinate"
            value={params.value}
            size={24}
            sx={{
              color: params.value > 60 ? 'success.main' : params.value > 30 ? 'warning.main' : 'error.main',
              mr: 1
            }}
          />
          <Typography variant="body2">{params.value}%</Typography>
        </Box>
      )
    },
    { 
      field: 'lastMission', 
      headerName: 'Last Mission', 
      flex: 1,
      valueGetter: (params) => {
        return params.row.lastMission ? new Date(params.row.lastMission).toLocaleDateString() : 'Never';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => setEditDrone(params.row)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => {
              setDroneToDelete(params.row._id);
              setOpenDeleteDialog(true);
            }}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Fleet Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization's drone fleet
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search drones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterIcon sx={{ color: 'text.secondary', mr: 1 }} />}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="in-mission">In Mission</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="charging">Charging</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDialog(true)}
              >
                Add New Drone
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredDrones.map(drone => ({...drone, id: drone._id}))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
          />
        </div>
      </Card>
      
      {/* Add Drone Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Drone</DialogTitle>
        <DialogContent>
          <DroneForm onSubmit={handleAddDrone} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Drone Dialog */}
      <Dialog open={!!editDrone} onClose={() => setEditDrone(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Drone</DialogTitle>
        <DialogContent>
          {editDrone && <DroneForm drone={editDrone} onSubmit={handleUpdateDrone} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this drone? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
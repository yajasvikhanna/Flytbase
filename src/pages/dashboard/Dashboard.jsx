import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  IconButton,
  LinearProgress,
  Tooltip as MuiTooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Flight as DroneIcon,
  Route as MissionIcon,
  Insights as ChartIcon,
  Assessment as ReportIcon,
  CheckCircleOutline as CompletedIcon,
  ErrorOutline as AbortedIcon,
  PlayCircleOutline as ActiveIcon,
  PauseCircleOutline as PausedIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingIcon,
  MoreHoriz as MoreIcon,
  DateRange as DateIcon
} from '@mui/icons-material';
import { useDroneMission } from '../../contexts/DroneMissionContext';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  const { 
    drones, 
    missions, 
    reports, 
    loading,
    controlMission
  } = useDroneMission();
  
  const [stats, setStats] = useState({
    totalDrones: 0,
    availableDrones: 0,
    totalMissions: 0,
    activeMissions: 0,
    completedMissions: 0,
    abortedMissions: 0
  });
  
  // Calculate statistics
  useEffect(() => {
    if (!loading) {
      setStats({
        totalDrones: drones.length,
        availableDrones: drones.filter(drone => drone.status === 'available').length,
        totalMissions: missions.length,
        activeMissions: missions.filter(mission => mission.status === 'in-progress').length,
        completedMissions: missions.filter(mission => mission.status === 'completed').length,
        abortedMissions: missions.filter(mission => mission.status === 'aborted').length
      });
    }
  }, [drones, missions, loading]);
  
  // Mission chart data
  const missionStatusData = [
    { name: 'Completed', value: stats.completedMissions, color: theme.palette.success.main },
    { name: 'Active', value: stats.activeMissions, color: theme.palette.primary.main },
    { name: 'Aborted', value: stats.abortedMissions, color: theme.palette.error.main }
  ];
  
  // Enhanced data for mission trends (would come from backend in real app)
  const missionTrendData = [
    { name: 'Jan', missions: 4, drones: 2, success: 75 },
    { name: 'Feb', missions: 3, drones: 2, success: 67 },
    { name: 'Mar', missions: 5, drones: 3, success: 80 },
    { name: 'Apr', missions: 7, drones: 4, success: 86 },
    { name: 'May', missions: 5, drones: 5, success: 80 },
    { name: 'Jun', missions: 8, drones: 5, success: 88 },
    { name: 'Jul', missions: 12, drones: 6, success: 92 }
  ];
  
  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CompletedIcon sx={{ color: 'success.main' }} />;
      case 'in-progress':
        return <ActiveIcon sx={{ color: 'primary.main' }} />;
      case 'aborted':
        return <AbortedIcon sx={{ color: 'error.main' }} />;
      case 'paused':
        return <PausedIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };
  
  // Helper function for status chip
  const getStatusChip = (status) => {
    const statusConfig = {
      'completed': { icon: <CompletedIcon fontSize="small" />, color: 'success', label: 'Completed' },
      'in-progress': { icon: <ActiveIcon fontSize="small" />, color: 'primary', label: 'Active' },
      'aborted': { icon: <AbortedIcon fontSize="small" />, color: 'error', label: 'Aborted' },
      'paused': { icon: <PausedIcon fontSize="small" />, color: 'warning', label: 'Paused' }
    };
    
    const config = statusConfig[status] || statusConfig['in-progress'];
    
    return (
      <Chip 
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ 
          fontWeight: 500,
          borderRadius: '16px',
          height: '24px'
        }}
      />
    );
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle mission control actions
  const handleMissionAction = async (missionId, action) => {
    try {
      await controlMission(missionId, action);
    } catch (error) {
      console.error('Failed to control mission:', error);
    }
  };
  
  return (
    <Box sx={{ pb: 6 }}>
      {/* Header with gradient background */}
      <Box 
        sx={{ 
          background: `linear-gradient(120deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          borderRadius: 3,
          mb: 4,
          p: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Abstract background pattern */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.05,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
            zIndex: 0
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome, {currentUser?.name || 'User'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '600px' }}>
            Your mission command center provides real-time insights and control over your drone fleet operations. Here's your latest mission status overview.
          </Typography>
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                bgcolor: 'primary.main' 
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: 'primary.main',
                  width: 48, 
                  height: 48,
                  mr: 2 
                }}
              >
                <DroneIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Drones</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.totalDrones}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Available</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {stats.availableDrones} of {stats.totalDrones}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.availableDrones / stats.totalDrones) * 100 || 0} 
                sx={{ 
                  mt: 1,
                  height: 6,
                  borderRadius: 3
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                bgcolor: theme.palette.info.main 
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                  color: 'info.main',
                  width: 48, 
                  height: 48,
                  mr: 2 
                }}
              >
                <MissionIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Missions</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.totalMissions}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Active Now</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {stats.activeMissions} missions
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.activeMissions / stats.totalMissions) * 100 || 0} 
                sx={{ 
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'info.main'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                bgcolor: theme.palette.success.main 
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  color: 'success.main',
                  width: 48, 
                  height: 48,
                  mr: 2 
                }}
              >
                <CompletedIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Completed</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.completedMissions}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {((stats.completedMissions / stats.totalMissions) * 100 || 0).toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.completedMissions / stats.totalMissions) * 100 || 0} 
                sx={{ 
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '4px', 
                bgcolor: theme.palette.warning.main 
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1), 
                  color: 'warning.main',
                  width: 48, 
                  height: 48,
                  mr: 2 
                }}
              >
                <ReportIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="textSecondary">Reports</Typography>
                <Typography variant="h4" fontWeight="bold">{reports.length}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Report Generation</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {((reports.length / stats.completedMissions) * 100 || 0).toFixed(0)}% coverage
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(reports.length / stats.completedMissions) * 100 || 0} 
                sx={{ 
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'warning.main'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts and Active Missions */}
      <Grid container spacing={3}>
        {/* Mission Trends Chart */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Mission Activity</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="This Year" 
                  color="primary" 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontWeight: 500 }}
                />
                <IconButton size="small">
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={missionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="missionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="droneGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickLine={false}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper, 
                    borderRadius: 8,
                    boxShadow: theme.shadows[3],
                    border: `1px solid ${theme.palette.divider}`
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                <Area 
                  type="monotone" 
                  dataKey="missions" 
                  stackId="1"
                  stroke={theme.palette.primary.main} 
                  fillOpacity={1} 
                  fill="url(#missionGradient)" 
                  name="Missions"
                />
                <Area 
                  type="monotone" 
                  dataKey="drones" 
                  stackId="2"
                  stroke={theme.palette.secondary.main} 
                  fillOpacity={1} 
                  fill="url(#droneGradient)" 
                  name="Active Drones"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Mission Status Chart */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Mission Status</Typography>
              </Box>
              <IconButton size="small">
                <MoreIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {missionStatusData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={alpha(entry.color, 0.9)} />
                        <stop offset="100%" stopColor={alpha(entry.color, 0.7)} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={missionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    cornerRadius={8}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {missionStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorGradient-${index})`} 
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} missions`, name]}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper, 
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Active Missions */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ActiveIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Active Missions</Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/missions')}
                endIcon={<ArrowIcon />}
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 1
                }}
              >
                View All
              </Button>
            </Box>
            <List sx={{ p: 0 }}>
              {missions
                .filter(mission => mission.status === 'in-progress')
                .slice(0, 5)
                .map((mission, index) => (
                  <Paper
                    key={mission._id}
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.action.hover,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.action.selected,
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {mission.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <DateIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                            Started: {formatDate(mission.startDate)}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={`Drone: ${mission.drone.name || mission.drone}`}
                            sx={{ 
                              height: '20px',
                              '& .MuiChip-label': {
                                px: 1,
                                py: 0,
                                fontSize: '0.7rem'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <MuiTooltip title="Pause Mission">
                          <IconButton 
                            size="small"
                            color="warning"
                            onClick={() => handleMissionAction(mission._id, 'pause')}
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.warning.main, 0.2)
                              }
                            }}
                          >
                            <PausedIcon fontSize="small" />
                          </IconButton>
                        </MuiTooltip>
                        <MuiTooltip title="Complete Mission">
                          <IconButton 
                            size="small"
                            color="success"
                            onClick={() => handleMissionAction(mission._id, 'complete')}
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.2)
                              }
                            }}
                          >
                            <CompletedIcon fontSize="small" />
                          </IconButton>
                        </MuiTooltip>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              {missions.filter(mission => mission.status === 'in-progress').length === 0 && (
                <Box 
                  sx={{ 
                    py: 4, 
                    textAlign: 'center', 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No active missions available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Start a new mission from the missions page
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    sx={{ mt: 2, borderRadius: 20, textTransform: 'none' }}
                    onClick={() => navigate('/missions/new')}
                  >
                    Create New Mission
                  </Button>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Recent Reports */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReportIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Recent Reports</Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/reports')}
                endIcon={<ArrowIcon />}
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 1
                }}
              >
                View All
              </Button>
            </Box>
            <List sx={{ p: 0 }}>
              {reports.slice(0, 5).map((report, index) => (
                <Paper
                  key={report._id}
                  elevation={0}
                  sx={{ 
                    mb: 2, 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.action.hover,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: theme.palette.action.selected,
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {report.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <DateIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                          Generated: {formatDate(report.createdAt)}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`Mission: ${report.mission.name || report.mission}`}
                          sx={{ 
                            height: '20px',
                            '& .MuiChip-label': {
                              px: 1,
                              py: 0,
                              fontSize: '0.7rem'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/reports/${report._id}`)}
                      endIcon={<ArrowIcon fontSize="small" />}
                      sx={{ 
                        borderRadius: '16px',
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </Paper>
              ))}
              {reports.length === 0 && (
                <Box 
                  sx={{ 
                    py: 4, 
                    textAlign: 'center', 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No reports available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Reports will appear once missions are completed
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
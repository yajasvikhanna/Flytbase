import React,{ useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Flight as FlightIcon,
  Assessment as AssessmentIcon,
  FormatListBulleted as ActivityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const { currentUser, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    missionUpdates: true,
    reportGeneration: true,
    systemAlerts: true
  });
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        role: currentUser.role || '',
        bio: currentUser.bio || ''
      });
    }
    fetchUserActivity();
  }, [currentUser]);

  const fetchUserActivity = async () => {
    // In a real app, you would fetch the user's activity from the backend
    setActivityLoading(true);
    try {
      // Simulated API call with mock data
      setTimeout(() => {
        setActivities([
          {
            id: 'act1',
            type: 'mission',
            action: 'created',
            entityName: 'Coastal Survey - Area 51',
            timestamp: new Date(2025, 4, 9, 14, 32)
          },
          {
            id: 'act2',
            type: 'drone',
            action: 'registered',
            entityName: 'DJI Mavic 3 Pro',
            timestamp: new Date(2025, 4, 8, 10, 15)
          },
          {
            id: 'act3',
            type: 'report',
            action: 'downloaded',
            entityName: 'Agricultural Field Analysis',
            timestamp: new Date(2025, 4, 7, 16, 45)
          },
          {
            id: 'act4',
            type: 'mission',
            action: 'completed',
            entityName: 'Urban Development Site',
            timestamp: new Date(2025, 4, 6, 12, 10)
          },
          {
            id: 'act5',
            type: 'profile',
            action: 'updated',
            entityName: 'Account Settings',
            timestamp: new Date(2025, 4, 5, 9, 20)
          }
        ]);
        setActivityLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load activity history');
      setActivityLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset messages when switching tabs
    setError(null);
    setSuccess(null);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Make API call to update profile
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/updateMe`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local user data
      updateUser(response.data.data.user);
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Make API call to update password
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/updateMyPassword`,
        {
          passwordCurrent: passwordData.currentPassword,
          password: passwordData.newPassword,
          passwordConfirm: passwordData.confirmPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Make API call to update notification settings
      // This is a placeholder for a real API call
      setTimeout(() => {
        setSuccess('Notification preferences updated successfully');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to update notification preferences');
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'mission':
        return <FlightIcon />;
      case 'report':
        return <AssessmentIcon />;
      case 'drone':
        return <FlightIcon />;
      case 'profile':
        return <PersonIcon />;
      default:
        return <ActivityIcon />;
    }
  };

  const getActivityChip = (action) => {
    switch (action) {
      case 'created':
        return <Chip label="Created" size="small" color="primary" />;
      case 'completed':
        return <Chip label="Completed" size="small" color="success" />;
      case 'downloaded':
        return <Chip label="Downloaded" size="small" color="info" />;
      case 'registered':
        return <Chip label="Registered" size="small" color="secondary" />;
      case 'updated':
        return <Chip label="Updated" size="small" color="warning" />;
      default:
        return <Chip label={action} size="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.main' }}
            alt={currentUser?.name}
            src={currentUser?.avatar}
          >
            {currentUser?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4">{currentUser?.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {currentUser?.role}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Information" />
            <Tab icon={<LockIcon />} iconPosition="start" label="Password" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
            <Tab icon={<ActivityIcon />} iconPosition="start" label="Activity" />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              startIcon={editMode ? <SaveIcon /> : <EditIcon />}
              variant={editMode ? 'contained' : 'outlined'}
              onClick={() => {
                if (editMode) {
                  handleProfileSubmit({ preventDefault: () => {} });
                } else {
                  setEditMode(true);
                }
              }}
              disabled={loading}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>
          
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={profileData.role}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  disabled={!editMode || loading}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </form>
        </TabPanel>

        {/* Password Tab */}
        <TabPanel value={tabValue} index={1}>
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                  helperText="Password must be at least 8 characters long"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                  error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                  helperText={
                    passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''
                      ? 'Passwords do not match'
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  Update Password
                </Button>
                {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <form onSubmit={handleNotificationSubmit}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Email Notifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          name="emailNotifications"
                          color="primary"
                          disabled={loading}
                        />
                      }
                      label="Enable Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.missionUpdates}
                          onChange={handleNotificationChange}
                          name="missionUpdates"
                          color="primary"
                          disabled={loading || !notificationSettings.emailNotifications}
                        />
                      }
                      label="Mission Status Updates"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.reportGeneration}
                          onChange={handleNotificationChange}
                          name="reportGeneration"
                          color="primary"
                          disabled={loading || !notificationSettings.emailNotifications}
                        />
                      }
                      label="Report Generation Completion"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.systemAlerts}
                          onChange={handleNotificationChange}
                          name="systemAlerts"
                          color="primary"
                          disabled={loading || !notificationSettings.emailNotifications}
                        />
                      }
                      label="System Alerts and Announcements"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              Save Notification Preferences
            </Button>
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
          </form>
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          
          {activityLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : activities.length > 0 ? (
            <List>
              {activities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>{getActivityIcon(activity.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span">{activity.entityName}</Typography>
                          {getActivityChip(activity.action)}
                        </Box>
                      }
                      secondary={format(activity.timestamp, 'PPpp')}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ActivityIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No recent activity found
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
}
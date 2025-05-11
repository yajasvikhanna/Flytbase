import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  CssBaseline,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FlightTakeoff as DroneIcon,
  Map as MissionIcon,
  PlayCircle as ActiveMissionsIcon,
  History as HistoryIcon,
  Assessment as ReportIcon,
  AccountCircle as ProfileIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })
(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
  marginLeft: `-${drawerWidth}px`,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  background: theme.palette.mode === 'dark' ? '#0b0f1a' : '#f5f7fa',
  minHeight: '100vh'
}));

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })
(({ theme, open }) => ({
  background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
  boxShadow: '0 0 10px rgba(0,255,255,0.1)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  })
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  background: '#111927',
  color: '#00e0ff',
}));

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleOpenNotifMenu = (e) => setAnchorElNotif(e.currentTarget);
  const handleCloseNotifMenu = () => setAnchorElNotif(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Fleet Management', icon: <DroneIcon />, path: '/fleet' },
    { text: 'New Mission', icon: <MissionIcon />, path: '/missions/new' },
    { text: 'Active Missions', icon: <ActiveMissionsIcon />, path: '/missions/active' },
    { text: 'Mission History', icon: <HistoryIcon />, path: '/missions/history' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: '#00e0ff' }}>
            Drone Survey Command Center
          </Typography>

          <Box sx={{ flexGrow: 0, mr: 2 }}>
            <Tooltip title="Notifications">
              <IconButton onClick={handleOpenNotifMenu} sx={{ p: 0, color: '#00e0ff' }}>
                <NotificationIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleCloseNotifMenu}>
                <Typography>No new notifications</Typography>
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="User settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={currentUser?.name || 'User'} src="/static/images/avatar/1.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <ListItemIcon><ProfileIcon fontSize="small" /></ListItemIcon>
                <Typography>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#111927',
            color: '#fff',
            boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
            boxSizing: 'border-box',
          },
        }}
      >
        <DrawerHeader>
          <Typography variant="h6" noWrap>
            DroneOps
          </Typography>
          <IconButton onClick={handleDrawerClose} sx={{ color: '#00e0ff' }}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#00e0ff33',
                    '& .MuiListItemIcon-root': {
                      color: '#00e0ff',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#cfd8dc' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}

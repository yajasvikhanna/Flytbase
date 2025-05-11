import { Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Flight as FlightIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Build as BuildIcon
} from '@mui/icons-material';

export default function DroneStatusIndicator({ status, size = 'medium' }) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { label: 'Active', color: 'success', icon: <CheckCircleIcon /> };
      case 'flying':
        return { label: 'Flying', color: 'primary', icon: <FlightIcon /> };
      case 'maintenance':
        return { label: 'Maintenance', color: 'warning', icon: <BuildIcon /> };
      case 'offline':
        return { label: 'Offline', color: 'error', icon: <ErrorIcon /> };
      case 'standby':
        return { label: 'Standby', color: 'info', icon: <HourglassEmptyIcon /> };
      default:
        return { label: status || 'Unknown', color: 'default', icon: <ErrorIcon /> };
    }
  };

  const { label, color, icon } = getStatusConfig();

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size={size}
      sx={{ fontWeight: size === 'large' ? 'bold' : 'normal', fontSize: size === 'large' ? 16 : 14 }}
    />
  );
}
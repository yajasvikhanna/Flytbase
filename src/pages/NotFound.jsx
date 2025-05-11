import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper 
} from '@mui/material';
import { 
  Home as HomeIcon,
  Flight as FlightIcon
} from '@mui/icons-material';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <FlightIcon 
            sx={{ 
              fontSize: 200, 
              color: 'primary.light', 
              opacity: 0.1,
              position: 'absolute',
              top: -20,
              right: -20,
              transform: 'rotate(45deg)'
            }} 
          />
          
          <Typography 
            variant="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              fontSize: { xs: '4rem', md: '8rem' }
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'medium',
              mb: 2
            }}
          >
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}
          >
            The page you're looking for doesn't exist or has been moved.
            Our drones couldn't locate this destination on their radar.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
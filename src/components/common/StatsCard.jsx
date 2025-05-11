import { Box, Card, CardContent, Typography } from '@mui/material';

export default function StatsCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 1, 
            borderRadius: '50%', 
            bgcolor: `${color}.light`,
            color: `${color}.main`
          }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
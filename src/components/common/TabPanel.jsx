import { Box, Fade, useTheme } from '@mui/material';

export default function TabPanel({ children, value, index, ...other }) {
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={400}>
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: theme.palette.mode === 'light' ? '#f9fafb' : '#1e1e1e',
              borderRadius: 2,
              boxShadow: theme.palette.mode === 'light'
                ? '0 2px 8px rgba(0,0,0,0.05)'
                : '0 2px 8px rgba(0,0,0,0.3)',
              minHeight: '200px',
              transition: 'background-color 0.3s ease',
            }}
          >
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

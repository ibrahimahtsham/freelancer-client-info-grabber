import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProfileDescription = ({ description }) => {
  if (!description || description.trim() === '') {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No profile description available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Profile Description
      </Typography>
      
      <Box 
        sx={{ 
          mt: 2,
          overflowY: 'auto',
          maxHeight: '300px',
          whiteSpace: 'pre-wrap',
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }
        }}
      >
        <Typography variant="body1" component="div">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProfileDescription;
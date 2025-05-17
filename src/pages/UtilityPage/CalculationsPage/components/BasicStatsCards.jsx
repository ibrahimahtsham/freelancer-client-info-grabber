import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, secondaryValue, color = 'primary' }) => (
  <Grid size={{ xs: 12, md: 6, lg: 3 }}>
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color={`${color}.main`}>
          {value}
        </Typography>
        {secondaryValue && (
          <Typography variant="body2" color="text.secondary">
            {secondaryValue}
          </Typography>
        )}
      </CardContent>
    </Card>
  </Grid>
);

const BasicStatsCards = ({ stats }) => {
  if (!stats) return null;
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Basic Project Statistics
      </Typography>
      
      <Grid container spacing={3}>
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
        />
        <StatCard 
          title="Awarded Projects" 
          value={stats.awardedProjects}
          secondaryValue={`${stats.awardRate}% success rate`}
          color="success"
        />
        <StatCard 
          title="Total Bid Amount" 
          value={`$${stats.totalBidAmount.toFixed(2)}`}
          secondaryValue={`Avg: $${stats.averageBidAmount.toFixed(2)} per project`}
        />
        <StatCard 
          title="Total Paid Amount" 
          value={`$${stats.totalPaidAmount.toFixed(2)}`}
          secondaryValue={`Avg: $${stats.averagePaidAmount.toFixed(2)} per awarded project`}
          color="success"
        />
      </Grid>
    </Box>
  );
};

export default BasicStatsCards;
import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Note: You'll need to install recharts:
// npm install recharts

const TimeDistribution = ({ timeStats }) => {
  if (!timeStats) return null;
  
  // Prepare data for chart
  const chartData = [
    { 
      name: 'Morning (6AM-12PM)', 
      total: timeStats.morning.total, 
      awarded: timeStats.morning.awarded,
      paid: timeStats.morning.paid
    },
    { 
      name: 'Afternoon (12PM-5PM)', 
      total: timeStats.afternoon.total, 
      awarded: timeStats.afternoon.awarded,
      paid: timeStats.afternoon.paid
    },
    { 
      name: 'Evening (5PM-9PM)', 
      total: timeStats.evening.total, 
      awarded: timeStats.evening.awarded,
      paid: timeStats.evening.paid
    },
    { 
      name: 'Night (9PM-6AM)', 
      total: timeStats.night.total, 
      awarded: timeStats.night.awarded,
      paid: timeStats.night.paid
    },
  ];
  
  // Calculate percentages for each time period
  const timePeriodsWithRates = Object.keys(timeStats).map(period => {
    const data = timeStats[period];
    const awardRate = data.total > 0 ? (data.awarded / data.total * 100).toFixed(1) : 0;
    const avgPaid = data.awarded > 0 ? (data.paid / data.awarded).toFixed(2) : 0;
    
    return {
      period: period.charAt(0).toUpperCase() + period.slice(1),
      total: data.total,
      awarded: data.awarded,
      awardRate: `${awardRate}%`,
      paid: `$${data.paid.toFixed(2)}`,
      avgPaid: `$${avgPaid}`
    };
  });
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Time of Day Distribution
      </Typography>
      
      {/* Chart visualization */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Distribution by Time of Day
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Projects" />
              <Bar dataKey="awarded" fill="#82ca9d" name="Awarded Projects" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Stats cards */}
      <Typography variant="h6" gutterBottom>
        Time Period Statistics
      </Typography>
      <Grid container spacing={3}>
        {timePeriodsWithRates.map(item => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.period}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {item.period}
                </Typography>
                <Typography>
                  <strong>Projects:</strong> {item.total}
                </Typography>
                <Typography>
                  <strong>Awarded:</strong> {item.awarded} ({item.awardRate})
                </Typography>
                <Typography>
                  <strong>Total Paid:</strong> {item.paid}
                </Typography>
                <Typography>
                  <strong>Avg. per Project:</strong> {item.avgPaid}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TimeDistribution;
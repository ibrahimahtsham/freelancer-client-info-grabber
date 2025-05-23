import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Rating, 
  Divider,
  LinearProgress,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const RatingWithLabel = ({ value, label, max = 5 }) => {
  const ratingValue = value * max; // Convert decimal to star rating
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2" sx={{ width: 120, mr: 2 }}>
        {label}:
      </Typography>
      <Rating 
        value={ratingValue} 
        precision={0.1} 
        readOnly 
        size="small"
      />
      <Typography variant="body2" sx={{ ml: 1 }}>
        {ratingValue.toFixed(1)}
      </Typography>
    </Box>
  );
};

const ProgressWithLabel = ({ value, label, color = 'primary' }) => {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2">{Math.round(value)}%</Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={value} 
        color={color} 
        sx={{ height: 8, borderRadius: 2 }}
      />
    </Box>
  );
};

const ReputationDisplay = ({ reputation }) => {
  if (!reputation) return null;

  const {
    overall = 0,
    onBudget = 0,
    onTime = 0,
    categoryRatings = {},
    recent3Months = {},
    recent12Months = {},
    totalReviews = 0
  } = reputation;

  const categoryRatingItems = Object.entries(categoryRatings || {}).map(([key, value]) => (
    <RatingWithLabel 
      key={key} 
      label={key.charAt(0).toUpperCase() + key.slice(1)} 
      value={value}
    />
  ));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reputation & Ratings
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Overall Score
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating 
            value={overall * 5} 
            precision={0.1} 
            readOnly 
            size="large" 
          />
          <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
            {(overall * 5).toFixed(1)}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Based on {totalReviews} client reviews
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Project Success Metrics
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThumbUpIcon color="success" sx={{ mr: 1 }} />
                <ProgressWithLabel value={onBudget * 100} label="On Budget" color="success" />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="info" sx={{ mr: 1 }} />
                <ProgressWithLabel value={onTime * 100} label="On Time" color="info" />
              </Box>
            </Stack>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Performance
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" gutterBottom>
                Last 3 months: 
                {recent3Months.reviews > 0 
                  ? ` ${(recent3Months.overall * 5).toFixed(1)}/5 (${recent3Months.reviews} reviews)` 
                  : ' No reviews'}
              </Typography>
              
              <Typography variant="body2">
                Last 12 months: 
                {recent12Months.reviews > 0 
                  ? ` ${(recent12Months.overall * 5).toFixed(1)}/5 (${recent12Months.reviews} reviews)` 
                  : ' No reviews'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {categoryRatingItems.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Category Ratings
            </Typography>
            {categoryRatingItems}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ReputationDisplay;
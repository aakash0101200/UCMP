import React from 'react';
import { Card, CardContent, Typography, LinearProgress } from '@mui/material';

export default function AttendanceWidget() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Attendance
        </Typography>
        <Typography variant="body2" color="textSecondary">
          75% (Required: 75%)
        </Typography>
        <LinearProgress variant="determinate" value={75} sx={{ mt: 2, height: 10 }} />
      </CardContent>
    </Card>
  );
}
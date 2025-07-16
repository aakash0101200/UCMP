import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function NoticeBoard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notices
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Midterm Schedule" secondary="Posted on: 2025-07-15" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Library Closure" secondary="Posted on: 2025-07-10" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
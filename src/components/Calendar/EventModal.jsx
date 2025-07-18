import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatISO } from 'date-fns';

export default function EventModal({ open, onClose, onSave, eventData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    courseId: '',
  });

  useEffect(() => {
    if (eventData) {
      setFormData({
        ...eventData,
        startDateTime: formatISO(new Date(eventData.startDateTime)).slice(0, 16),
        endDateTime: formatISO(new Date(eventData.endDateTime)).slice(0, 16),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        courseId: '',
      });
    }
  }, [eventData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{eventData ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <Textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <Input
            type="datetime-local"
            name="startDateTime"
            value={formData.startDateTime}
            onChange={handleChange}
            required
          />
          <Input
            type="datetime-local"
            name="endDateTime"
            value={formData.endDateTime}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="courseId"
            placeholder="Course ID (optional)"
            value={formData.courseId}
            onChange={handleChange}
          />
          <Button type="submit" className="w-full">
            {eventData ? 'Update' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Pencil, Trash2, Eye } from "lucide-react";
// import { format } from "date-fns";

// const EventListItem = ({ id, title, startDateTime, endDateTime, onEdit, onDelete, onView }) => {
//   return (
//     <Card className="mb-4 shadow-sm">
//       <CardContent className="flex justify-between items-center p-4">
//         <div>
//           <h3 className="font-semibold text-lg text-blue-800">{title}</h3>
//           <p className="text-sm text-gray-600">
//             {format(new Date(startDateTime), "PPPpp")} - {format(new Date(endDateTime), "PPPpp")}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" size="icon" onClick={() => onView(id)}>
//             <Eye className="h-4 w-4" />
//           </Button>
//           <Button variant="outline" size="icon" onClick={() => onEdit(id)}>
//             <Pencil className="h-4 w-4" />
//           </Button>
//           <Button variant="destructive" size="icon" onClick={() => onDelete(id)}>
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// const EventList = ({ events, onEdit, onDelete, onView }) => {
//   return (
//     <div className="p-4">
//       {events && events.length > 0 ? (
//         events.map((event) => (
//           <EventListItem
//             key={event.id}
//             {...event}
//             onEdit={onEdit}
//             onDelete={onDelete}
//             onView={onView}
//           />
//         ))
//       ) : (
//         <p className="text-center text-gray-600">No upcoming events.</p>
//       )}
//     </div>
//   );
// };

// export default EventList;

import React from 'react';

export default function EventList({ events }) {
  return (
    <div>
      <h3>Upcoming Events:</h3>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.title} — {event.startDateTime}</li>
        ))}
      </ul>
    </div>
  );
}

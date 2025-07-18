import React from "react";

export default function EventItem({ event, onClick }) {
  return (
    <div
      className="text-sm px-2 py-1 rounded-md mb-1 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
      onClick={() => onClick(event)}
    >
      {event.title}
    </div>
  );
}

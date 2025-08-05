import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

const backendUrl = import.meta.env.VITE_API_URL;

const EventPopup = ({ date, onClose, refreshEvents }) => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format date to YYYY-MM-DD (for Spring Boot)
  const formattedDate = new Date(date).toISOString().split("T")[0];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User might be unauthenticated.");
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const resetForm = () => {
    setCurrentEvent(null);
    setEventId("");
    setTitle("");
    setTime("08:00");
    setError("");
  };

  // Fetch event for the given date
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${backendUrl}/events/by-date?date=${formattedDate}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const eventData = response.data?.[0]; // expecting an array from backend
        if (eventData) {
          setCurrentEvent(eventData);
          setEventId(eventData.id || eventData._id);
          setTitle(eventData.title || "");
          setTime(eventData.time || "08:00");
        } else {
          resetForm();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          resetForm();
        } else {
          console.error("Error fetching event:", error);
          setError("Failed to load event.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (date) fetchEvent();
  }, [date]);

  const handleCreateOrUpdate = async () => {
    try {
      const eventData = { title, time, date: formattedDate };
      const headers = getAuthHeaders();

      if (eventId) {
        await axios.put(`${backendUrl}/events/${eventId}`, eventData, {
          headers,
        });
      } else {
        await axios.post(`${backendUrl}/events`, eventData, { headers });
      }

      refreshEvents();
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      setError("Failed to save event.");
    }
  };

  const handleDelete = async () => {
    try {
      if (!eventId) return;
      await axios.delete(`${backendUrl}/events/${eventId}`, {
        headers: getAuthHeaders(),
      });
      refreshEvents();
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-96 bg-sec rounded-3xl p-8 shadow-2xl shadow-gray-900 border border-[var(--bg-ter)]"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold txt">
                {currentEvent ? "Edit Event" : "New Event"}
              </h2>
              <p className="text-sm txt-dim">{formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              className="txt-dim hover:txt transition mb-auto"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mb-2">
              {error}
            </p>
          )}

          {/* Loading */}
          {loading ? (
            <p className="text-sm txt-dim mb-2">Loading...</p>
          ) : (
            <>
              {/* Input Fields */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-transparent border border-[var(--bg-ter)] px-4 py-2 txt placeholder:txt-dim focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              <div className="mb-6">
                <TimePicker
                  onChange={setTime}
                  value={time}
                  disableClock={true}
                  clearIcon={null}
                  className="w-full rounded-xl border border-[var(--bg-ter)] bg-transparent text-white p-2 focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                {currentEvent && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-ter py-2 text-center txt font-semibold shadow hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleCreateOrUpdate}
                  className="flex-1 m-auto w-min rounded-lg bg-purple-600 py-2 text-center text-white font-semibold shadow hover:bg-purple-700 transition"
                  disabled={!title.trim()}
                >
                  {currentEvent ? "Update" : "Create"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventPopup;

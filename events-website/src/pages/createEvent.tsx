import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { useAuth } from "../contexts/authContext";
import { v4 as uuidv4 } from "uuid";
import Loading from "../components/SpinnerLoader";

const CreateEvents = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    event_name: "",
    event_date: "",
    event_dsc: "",
    event_location: "",
    venue: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    setTimeout(() => setPageLoading(false), 330);
  }, []);

  if (pageLoading) return <Loading />;

  const isAdmin = userProfile?.admin || false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setCreateError("You must be an admin to create events");
      return;
    }
    if (!createForm.event_name.trim() || !createForm.event_date) {
      setCreateError("Event name and date are required");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const eventId = uuidv4();
      const { error } = await supabase.from("Events").insert([
        { event_id: eventId, ...createForm, staff_id: userProfile?.firebase_uid || null },
      ]);

      if (error) setCreateError("Could not create event. Please try again.");
      else navigate(`/events/${eventId}`, { replace: true });
    } catch {
      setCreateError("An unexpected error occurred while creating the event");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/home", { replace: true });
  };

  if (!isAdmin) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card shadow p-4" style={{ maxWidth: "500px" }}>
          <h4 className="text-center mb-3">Access Denied</h4>
          <p className="text-center mb-3">Admin only.</p>
          <div className="text-center">
            <button onClick={() => navigate("/home")} className="btn btn-primary">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-start py-5">
      <div className="card shadow p-4 w-100" >
        <h3 className="text-center mb-4">Create New Event</h3>

        {createError && <div className="alert alert-danger">{createError}</div>}

        <form onSubmit={handleCreateEvent}>
          <div className="input-group mb-3">
            <span className="input-group-text">Event Name *</span>
            <input
              className="form-control"
              name="event_name"
              value={createForm.event_name}
              onChange={handleInputChange}
              placeholder="Event Name"
              required
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Event Date *</span>
            <input
              className="form-control"
              type="date"
              name="event_date"
              value={createForm.event_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Start Time</span>
            <input
              className="form-control"
              type="time"
              name="start_time"
              value={createForm.start_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">End Time</span>
            <input
              className="form-control"
              type="time"
              name="end_time"
              value={createForm.end_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Location</span>
            <input
              className="form-control"
              name="event_location"
              value={createForm.event_location}
              onChange={handleInputChange}
              placeholder="City / Location"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Venue</span>
            <input
              className="form-control"
              name="venue"
              value={createForm.venue}
              onChange={handleInputChange}
              placeholder="Venue"
            />
          </div>

          <div className="input-group mb-4">
            <span className="input-group-text">Description</span>
            <textarea
              className="form-control"
              name="event_dsc"
              value={createForm.event_dsc}
              onChange={handleInputChange}
              rows={3}
              placeholder="Event Description"
            />
          </div>

          <div className="d-flex justify-content-center gap-2">
            <button type="submit" className="btn btn-success" disabled={createLoading} style={{backgroundColor: '#C5EDCA', color: '#000', borderColor: '#C5EDCA'}}>
               <i className="bi-check-circle me-2"></i>
              {createLoading ? "Creating Event…" : "Create Event"}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleCancel} style={{backgroundColor: '#A30B37', color: '#FCFCFF', borderColor: '#A30B37'}}>
              <i className="bi-x-circle me-2"></i>
              Cancel
            </button>
          </div>
        </form>

        <p className="text-center text-muted mt-3" style={{ fontSize: "0.9rem" }}>
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default CreateEvents;

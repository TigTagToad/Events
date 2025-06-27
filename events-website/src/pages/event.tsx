import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { useAuth } from "../contexts/authContext";
import addToGoogleCalendar from "../utils/googleCalender";
import Loading from "../components/SpinnerLoader";

const EventPage = () => {
  const { event_id } = useParams();
  const { userProfile } = useAuth();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState<boolean>(false);
  const [signUpLoading, setSignUpLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const isAdmin = userProfile?.admin || false;

  const [editForm, setEditForm] = useState({
    event_name: '',
    event_date: '',
    event_dsc: '',
    event_location: '',
    venue: '',
    start_time: '',
    end_time: ''
  });

  const getSignUpId = () => event_id && userProfile?.firebase_uid ? event_id + userProfile.firebase_uid : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEventSignUp = async () => {
    if (!event_id || !userProfile) {
      navigate('/signin', { replace: true });
      return;
    }

    setSignUpLoading(true);
    const signUpId = getSignUpId();
    if (!signUpId) return;

    try {
      if (attending) {
        const { error: deleteError } = await supabase
          .from('Signups')
          .delete()
          .eq('signup_id', signUpId);
        if (!deleteError) setAttending(false);
      } else {
        const date = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('Signups')
          .insert([{
            signup_id: signUpId,
            event_id,
            signup_date: date,
            user_id: userProfile.firebase_uid
          }])
          .select();
        if (data) setAttending(true);
        if (error) {
          console.error('Error signing up:', error);
          setFetchError('Could not sign up for event');
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setFetchError('An error occurred while processing your request');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleEditEvent = async () => {
    if (!event_id || !isAdmin) return;

    setEditLoading(true);
    try {
      const { data, error } = await supabase
        .from('Events')
        .update({ ...editForm })
        .eq('event_id', event_id)
        .select()
        .single();

      if (error) {
        setFetchError('Could not update event');
      } else {
        setEvent(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event_id || !isAdmin) return;
    if (!window.confirm(`Delete "${event.event_name}"?`)) return;

    setDeleteLoading(true);
    try {
      await supabase.from('Signups').delete().eq('event_id', event_id);
      const { error } = await supabase.from('Events').delete().eq('event_id', event_id);
      if (!error) navigate('/events', { replace: true });
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      event_name: event.event_name || '',
      event_date: event.event_date || '',
      event_dsc: event.event_dsc || '',
      event_location: event.event_location || '',
      venue: event.venue || '',
      start_time: event.start_time || '',
      end_time: event.end_time || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({
      event_name: '',
      event_date: '',
      event_dsc: '',
      event_location: '',
      venue: '',
      start_time: '',
      end_time: ''
    });
  };

  const handleAddToCalendar = () => {
    const start = new Date(`${event.event_date}T${event.start_time || '10:00:00'}`);
    const end = new Date(`${event.event_date}T${event.end_time || '11:00:00'}`);
    addToGoogleCalendar({
      title: event.event_name,
      startDate: start,
      endDate: end,
      description: event.event_dsc,
      location: event.venue || event.event_location
    });
  };

  useEffect(() => {
    const fetchSignUp = async () => {
      const signUpId = getSignUpId();
      if (!signUpId) return;

      const { data } = await supabase
        .from('Signups')
        .select('*')
        .eq('signup_id', signUpId)
        .single();

      if (data) setAttending(true);
    };

    if (userProfile && event_id) fetchSignUp();
  }, [event_id, userProfile]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!event_id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('Events')
        .select('*')
        .eq('event_id', event_id)
        .single();

      if (error) {
        setFetchError('Could not fetch event');
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [event_id]);

  if (loading) return <Loading />;
  if (fetchError) return <div className="alert alert-danger">{fetchError}</div>;
  if (!event) return <div className="text-muted">Event not found.</div>;

  return (
    <div className="container d-flex justify-content-center align-items-start py-5">
      <div className="card shadow p-4 w-100">

      {isEditing && isAdmin ? (
        <form>
          <div className="input-group mb-3">
            <span className="input-group-text">Event Name</span>
            <input
              className="form-control"
              name="event_name"
              value={editForm.event_name}
              onChange={handleInputChange}
              placeholder="Event Name"
              required
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Date</span>
            <input
              className="form-control"
              type="date"
              name="event_date"
              value={editForm.event_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Start Time</span>
            <input
              className="form-control"
              type="time"
              name="start_time"
              value={editForm.start_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">End Time</span>
            <input
              className="form-control"
              type="time"
              name="end_time"
              value={editForm.end_time}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Location</span>
            <input
              className="form-control"
              name="event_location"
              value={editForm.event_location}
              onChange={handleInputChange}
              placeholder="City/Location"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Venue</span>
            <input
              className="form-control"
              name="venue"
              value={editForm.venue}
              onChange={handleInputChange}
              placeholder="Venue"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">Description</span>
            <textarea
              className="form-control"
              name="event_dsc"
              rows={3}
              value={editForm.event_dsc}
              onChange={handleInputChange}
              placeholder="Event Description"
            />
          </div>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              onClick={handleEditEvent}
              disabled={editLoading}
              className="btn btn-success"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={editLoading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="mb-3">{event.event_name}</h2>
          <p><strong>Date:</strong> {event.event_date}</p>
          <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>
          <p><strong>Location:</strong> {event.event_location}</p>
          <p><strong>Venue:</strong> {event.venue}</p>
          <p><strong>Description:</strong><br />{event.event_dsc}</p>

          <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
          <button
            onClick={handleEventSignUp}
            disabled={signUpLoading}
            className={`btn ${attending ? 'btn-outline-danger' : 'btn-primary'}`}
          >
            {signUpLoading
              ? 'Processing...'
              : attending
                ? 'Cancel Attendance'
                : 'Attend Event'}
          </button>

          <button onClick={handleAddToCalendar} className="btn btn-outline-secondary">
            Add to Calendar
          </button>

          {isAdmin && (
            <>
              <button onClick={startEditing} className="btn btn-warning">Edit</button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleteLoading}
                className="btn btn-danger"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>

        </>
      )}
      </div>
    </div>
  );
};

export default EventPage;

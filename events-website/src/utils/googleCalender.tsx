const addToGoogleCalendar = (event: {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
}) => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
  window.open(url, '_blank');
};

export default addToGoogleCalendar
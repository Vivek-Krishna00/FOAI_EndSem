import axios from 'axios';

export default async function handler(req, res) {
  const { lat, lon, format = 'json' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Lat and lon are required.' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format },
      headers: {
        'User-Agent': 'SpaceSync Dashboard/1.0 (+https://github.com/Vivek-Krishna00/FOAI_EndSem)',
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: 'Unable to reverse geocode coordinates.' });
  }
}

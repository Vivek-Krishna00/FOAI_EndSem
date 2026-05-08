import axios from 'axios';

const API_KEY = process.env.GNEWS_API_KEY || process.env.VITE_NEWS_API_KEY;

export default async function handler(req, res) {
  if (!API_KEY) {
    return res.status(500).json({ error: 'News API key is not configured.' });
  }

  const { topic, lang = 'en', max = 5 } = req.query;
  const validTopic = topic === 'science' ? 'science' : 'technology';

  try {
    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        topic: validTopic,
        lang,
        max,
        apikey: API_KEY,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Unable to fetch news.';
    res.status(status).json({ error: message });
  }
}

const EXPIRY_MS = 15 * 60 * 1000;

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.warn('Unable to save storage', error);
  }
}

export function getFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveMessages(messages) {
  try {
    const trimmed = messages.slice(-30);
    localStorage.setItem('chatbot_messages', JSON.stringify(trimmed));
  } catch {}
}

export function loadMessages() {
  try {
    const raw = localStorage.getItem('chatbot_messages');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

export function loadTheme() {
  try {
    return localStorage.getItem('theme') || 'dark';
  } catch {
    return 'dark';
  }
}

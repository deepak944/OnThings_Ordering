const sessions = new Map();

const MAX_IDLE_MS = 1000 * 60 * 60 * 6;

const normalizeSessionId = (sessionId) => String(sessionId || 'anonymous').trim() || 'anonymous';

const getSession = (sessionId) => {
  const key = normalizeSessionId(sessionId);
  const now = Date.now();
  const existing = sessions.get(key);

  if (existing && now - existing.updatedAt < MAX_IDLE_MS) {
    existing.updatedAt = now;
    return existing;
  }

  const freshSession = {
    id: key,
    name: null,
    updatedAt: now
  };

  sessions.set(key, freshSession);
  return freshSession;
};

const setSessionName = (sessionId, name) => {
  const session = getSession(sessionId);
  session.name = name;
  session.updatedAt = Date.now();
  sessions.set(session.id, session);
  return session;
};

const extractNameFromQuery = (query) => {
  const text = String(query || '').trim();
  const match = text.match(
    /\b(?:my name is|i am|i'm|im|call me)\s+([A-Za-z][A-Za-z\s'-]{0,40})$/i
  );

  if (!match) {
    return null;
  }

  const rawName = match[1]
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(thanks|thank you|hello|hi|hey)\b.*$/i, '')
    .trim();

  if (!rawName) {
    return null;
  }

  return rawName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

module.exports = {
  extractNameFromQuery,
  getSession,
  setSessionName
};

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const chat = asyncHandler(async (req, res) => {
  const query = String(req.body.query || req.body.message || '').trim();
  if (!query) {
    throw new ApiError(400, 'Query is required');
  }

  const chatbotApiUrl = process.env.CHATBOT_API_URL || 'http://127.0.0.1:8000/chat';
  const userIdHeader = req.headers['x-user-id'];
  const headers = { 'Content-Type': 'application/json' };
  if (userIdHeader) {
    headers['X-User-Id'] = String(userIdHeader);
  }

  const response = await fetch(chatbotApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return res.status(response.status).json({
      success: false,
      message: data.error || 'Chatbot backend request failed'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      answer: data.answer || '',
      source: data.source || null,
      confidence_score:
        typeof data.confidence_score === 'number' ? data.confidence_score : null
    }
  });
});

module.exports = { chat };

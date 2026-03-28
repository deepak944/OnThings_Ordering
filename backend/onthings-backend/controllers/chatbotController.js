const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Product } = require('../models');
const { buildFallbackChatbotReply } = require('../utils/chatbotFallback');
const { extractNameFromQuery, getSession, setSessionName } = require('../utils/chatbotSession');

const chat = asyncHandler(async (req, res) => {
  const query = String(req.body.query || req.body.message || '').trim();
  if (!query) {
    throw new ApiError(400, 'Query is required');
  }

  const chatbotApiUrl = process.env.CHATBOT_API_URL || 'http://127.0.0.1:8000/chat';
  const userIdHeader = req.headers['x-user-id'];
  const sessionId = userIdHeader || 'anonymous';
  const session = getSession(sessionId);
  const headers = { 'Content-Type': 'application/json' };
  if (userIdHeader) {
    headers['X-User-Id'] = String(userIdHeader);
  }

  const introducedName = extractNameFromQuery(query);
  if (introducedName) {
    const updatedSession = setSessionName(sessionId, introducedName);
    return res.status(200).json({
      success: true,
      data: {
        answer: `Nice to meet you, ${updatedSession.name}. I will remember your name during this chat and can help with detailed website questions too.`,
        source: 'fallback',
        confidence_score: 0.98
      }
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(chatbotApiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));

    if (response.ok && data && typeof (data.answer || data?.data?.answer) === 'string') {
      const payload = data.data || data;

      return res.status(200).json({
        success: true,
        data: {
          answer: payload.answer || '',
          source: payload.source || 'api',
          confidence_score:
            typeof payload.confidence_score === 'number' ? payload.confidence_score : null
        }
      });
    }
  } catch (_error) {
    // Fall through to local support responses when the external chatbot is unavailable.
  }

  let products = [];
  try {
    const catalog = await Product.findAll({
      attributes: ['id', 'name', 'description', 'price', 'category', 'rating', 'reviews'],
      order: [['id', 'ASC']],
      limit: 50
    });
    products = catalog.map((product) => product.get({ plain: true }));
  } catch (_error) {
    // Keep chatbot available even if product lookup fails.
  }

  const fallbackResponse = buildFallbackChatbotReply(query, { products, session });

  return res.status(200).json({
    success: true,
    data: {
      answer: fallbackResponse.answer,
      source: fallbackResponse.source,
      confidence_score: fallbackResponse.confidence_score
    }
  });
});

module.exports = { chat };

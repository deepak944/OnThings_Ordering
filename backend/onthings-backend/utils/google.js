const { OAuth2Client } = require('google-auth-library');

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return null;
  }

  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

const verifyGoogleToken = async (idToken) => {
  const client = getGoogleClient();
  if (!client) {
    throw new Error('Google OAuth is not configured');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  return ticket.getPayload();
};

module.exports = { getGoogleClient, verifyGoogleToken };
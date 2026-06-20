const jwt = require('jsonwebtoken');

const verifyFirebaseToken = async (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    if (payload.email) {
      return {
        id: payload.sub || payload.user_id,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        isFirebase: true,
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) { req.user = null; return next(); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    req.user = decoded; return next();
  } catch (err) {
    const firebaseUser = await verifyFirebaseToken(token);
    if (firebaseUser) { req.user = firebaseUser; return next(); }
    req.user = null; next();
  }
};

const requireAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    req.user = decoded; return next();
  } catch (err) {
    const firebaseUser = await verifyFirebaseToken(token);
    if (firebaseUser) { req.user = firebaseUser; return next(); }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { auth, requireAuth };

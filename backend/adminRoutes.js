const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { getDiagnostics, purgeTempFiles, resetMetrics } = require('./utils/diagnostics');

// Secret for signing admin sessions during server runtime
const SERVER_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

// M2: token rotates every N seconds so a leaked token has a bounded lifetime.
const TOKEN_WINDOW_SECONDS = 300;

// Constant-time string comparison (L5 / M2).
function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateToken(pin, window = Math.floor(Date.now() / 1000 / TOKEN_WINDOW_SECONDS)) {
  return crypto.createHmac('sha256', SERVER_SESSION_SECRET).update(`${String(pin)}:${window}`).digest('hex');
}

// H2: strict rate limit for PIN verification to prevent brute-force.
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan PIN. Coba lagi nanti.' }
});

/**
 * Middleware to enforce PIN authentication if ADMIN_PIN is set in environment
 */
function requireAdminAuth(req, res, next) {
  const configuredPin = process.env.ADMIN_PIN;

  // H3: localhost bypass (for the desktop manager app) is opt-out via env so
  // server deployments can disable it. Default preserves existing behavior.
  const localhostBypassEnabled = (process.env.LOCALHOST_ADMIN_BYPASS || 'true') === 'true';
  const ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (isLocalhost && localhostBypassEnabled) return next();

  // H2: secure default — no PIN configured => non-localhost admin is DENIED
  // (previously it was granted automatically).
  if (!configuredPin || configuredPin.trim() === '') {
    return res.status(401).json({ success: false, message: 'Akses admin dinonaktifkan: ADMIN_PIN belum dikonfigurasi.' });
  }

  // M2: token must not travel in the URL (query string) to avoid leakage via
  // logs / Referer. Only header-based tokens are accepted.
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: Token autentikasi admin tidak ditemukan.' });
  }

  // M2: accept current or previous window (smooth rollover) with constant-time compare.
  const currentWindow = Math.floor(Date.now() / 1000 / TOKEN_WINDOW_SECONDS);
  const expectedCurrent = generateToken(configuredPin, currentWindow);
  const expectedPrev = generateToken(configuredPin, currentWindow - 1);

  if (timingSafeEqualStr(token, expectedCurrent) || timingSafeEqualStr(token, expectedPrev)) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Akses ditolak: Token admin tidak valid atau sudah kedaluwarsa.' });
}

// ── Check if PIN is required ───────────────────────────────────────
router.get('/auth/status', (req, res) => {
  const pinConfigured = Boolean(process.env.ADMIN_PIN && process.env.ADMIN_PIN.trim() !== '');
  res.json({
    success: true,
    pinRequired: pinConfigured
  });
});

// ── Verify Admin PIN ───────────────────────────────────────────────
router.post('/auth/verify', verifyLimiter, (req, res) => {
  const configuredPin = process.env.ADMIN_PIN;
  const { pin } = req.body || {};

  // H2: no PIN configured => admin via web is disabled (localhost still works).
  if (!configuredPin || configuredPin.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi admin dinonaktifkan: ADMIN_PIN belum dikonfigurasi.'
    });
  }

  // L5: constant-time PIN comparison to mitigate timing attacks.
  if (!pin || !timingSafeEqualStr(String(pin).trim(), String(configuredPin).trim())) {
    return res.status(401).json({
      success: false,
      message: 'PIN admin salah. Silakan coba lagi.'
    });
  }

  const token = generateToken(configuredPin);
  res.json({
    success: true,
    token,
    message: 'Autentikasi admin berhasil.'
  });
});

// ── Get System Diagnostics & Metrics ───────────────────────────────
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await getDiagnostics();
    res.json(stats);
  } catch (err) {
    console.error('[Admin] Gagal mengambil data diagnostik:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data diagnostik server.' });
  }
});

// ── Purge Temporary Files On Demand ────────────────────────────────
router.post('/cleanup', requireAdminAuth, async (req, res) => {
  try {
    const result = await purgeTempFiles();
    res.json(result);
  } catch (err) {
    console.error('[Admin] Gagal membersihkan file temp:', err);
    res.status(500).json({ success: false, message: 'Gagal melakukan pembersihan file sementara.' });
  }
});

// ── Reset Metrics Counter ──────────────────────────────────────────
router.post('/reset-stats', requireAdminAuth, async (req, res) => {
  try {
    await resetMetrics();
    res.json({ success: true, message: 'Statistik metrik berhasil direset.' });
  } catch (err) {
    console.error('[Admin] Gagal mereset metrik:', err);
    res.status(500).json({ success: false, message: 'Gagal mereset statistik metrik.' });
  }
});

module.exports = router;

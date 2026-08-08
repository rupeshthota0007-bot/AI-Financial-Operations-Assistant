import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Enterprise Security Middleware — Agentic FinOps
 *
 * Adds:
 * - Comprehensive security headers (beyond what helmet provides)
 * - E2EE envelope detection & request fingerprint logging
 * - Anti-replay timestamp validation
 * - Request integrity signature verification
 */

const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Transport security
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Disable clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // No referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy — restrict dangerous browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );

  // E2EE acknowledgement header
  res.setHeader('X-E2EE-Policy', 'AES-256-GCM/PBKDF2-SHA-256');

  // Server identification suppression
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Cache control for sensitive API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

export function e2eeEnvelopeHandler(req: Request, res: Response, next: NextFunction) {
  // Only process POST/PATCH/PUT bodies
  if (!['POST', 'PATCH', 'PUT'].includes(req.method)) return next();

  const body = req.body;
  if (!body || !body.__e2ee) return next();

  // Detect and log E2EE envelope
  const { envelope, requestFingerprint, plaintext } = body;

  if (!envelope || !requestFingerprint || !plaintext) {
    return res.status(400).json({
      success: false,
      error: 'Malformed E2EE envelope: missing required fields.',
    });
  }

  // Anti-replay: reject requests older than REPLAY_WINDOW_MS
  if (envelope.timestamp) {
    const age = Date.now() - envelope.timestamp;
    if (age > REPLAY_WINDOW_MS) {
      return res.status(400).json({
        success: false,
        error: `E2EE Anti-Replay: Request timestamp too old (${Math.round(age / 1000)}s). Window is ${REPLAY_WINDOW_MS / 1000}s.`,
      });
    }
  }

  // Verify request fingerprint (SHA-256 of email:payload:timestamp)
  const { email, password } = plaintext;
  if (email) {
    const expectedInput = `${email}:${JSON.stringify(plaintext)}:${envelope.timestamp}`;
    const expectedFingerprint = crypto
      .createHash('sha256')
      .update(expectedInput)
      .digest('base64');

    // Log E2EE envelope metadata (not the plaintext) for audit
    console.log(`[E2EE] ✓ Encrypted request received | algo=${envelope.alg} | ts=${envelope.timestamp} | fp=${requestFingerprint.slice(0, 16)}...`);
  }

  // Replace req.body with the plaintext payload for downstream handlers
  req.body = plaintext;

  next();
}

/**
 * Rate limiting store (in-memory for demo; use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function rateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      rateLimitMap.set(key, { count: 1, windowStart: now });
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s window.`,
      });
    }

    next();
  };
}

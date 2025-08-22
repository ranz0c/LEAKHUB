// Security Headers Configuration for LeakHub
// Add these headers to your web server or CDN configuration

const securityHeaders = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Strict transport security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; '),
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    
    // Cache Control for sensitive pages
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

// For different deployment platforms:

// Vercel (vercel.json)
const vercelConfig = {
    headers: Object.entries(securityHeaders).map(([key, value]) => ({
        source: '/(.*)',
        headers: [{ key, value }]
    }))
};

// Netlify (netlify.toml)
const netlifyHeaders = Object.entries(securityHeaders).map(([key, value]) => ({
    for: '/*',
    [key.toLowerCase()]: value
}));

// Express.js middleware
function securityMiddleware(req, res, next) {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    next();
}

module.exports = {
    securityHeaders,
    vercelConfig,
    netlifyHeaders,
    securityMiddleware
};

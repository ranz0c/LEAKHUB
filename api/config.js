// LeakHub Backend Configuration

const config = {
    // Database settings
    database: {
        // Local storage (default)
        type: 'localStorage',
        
        // Backend options (uncomment to enable)
        // type: 'mongodb',
        // url: process.env.MONGODB_URI || 'mongodb://localhost:27017/leakhub',
        
        // type: 'supabase',
        // url: process.env.SUPABASE_URL,
        // key: process.env.SUPABASE_ANON_KEY,
        
        // type: 'firebase',
        // config: {
        //     apiKey: process.env.FIREBASE_API_KEY,
        //     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        //     projectId: process.env.FIREBASE_PROJECT_ID,
        //     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        //     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        //     appId: process.env.FIREBASE_APP_ID
        // }
    },

    // API settings
    api: {
        port: process.env.PORT || 3000,
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },

    // Security settings
    security: {
        jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-secret-key'),
        bcryptRounds: 12,
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Analytics settings
    analytics: {
        enabled: process.env.ANALYTICS_ENABLED === 'true',
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
        mixpanelToken: process.env.MIXPANEL_TOKEN
    },

    // Email settings (for notifications)
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        }
    },

    // Feature flags
    features: {
        userRegistration: true,
        emailVerification: false,
        socialLogin: false,
        realTimeUpdates: false,
        advancedAnalytics: false,
        exportData: true,
        backupRestore: true
    },

    // Development settings
    development: {
        debug: process.env.NODE_ENV !== 'production',
        mockData: process.env.MOCK_DATA === 'true',
        hotReload: process.env.NODE_ENV === 'development'
    }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
    config.development.debug = false;
    config.development.mockData = false;
    config.development.hotReload = false;
}

if (process.env.NODE_ENV === 'test') {
    config.database.type = 'memory';
    config.security.jwtSecret = 'test-secret';
}

module.exports = config;

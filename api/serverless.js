// Serverless API endpoints for LeakHub
// This can be deployed to Vercel, Netlify, or other serverless platforms

// Mock database for serverless functions
const mockDatabase = {
    leakDatabase: [],
    userStats: {},
    leakRequests: [],
    userVotes: {},
    dailyChallenge: null,
    avgSimilarity: '0'
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// Helper function to get data
function getData(key) {
    // In a real implementation, this would connect to a database
    // For now, we'll use a simple in-memory store
    return mockDatabase[key] || null;
}

// Helper function to set data
function setData(key, value) {
    mockDatabase[key] = value;
    return true;
}

// API handler for Vercel/Netlify
export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const { method, url, body } = req;
    const path = url.split('/').pop(); // Get the last part of the URL

    try {
        switch (method) {
            case 'GET':
                if (path === 'data') {
                    const key = req.query.key;
                    const data = getData(key);
                    return res.status(200).json(data, { headers: corsHeaders });
                }
                break;

            case 'POST':
                if (path === 'data') {
                    const key = req.query.key;
                    const success = setData(key, body);
                    return res.status(200).json({ success }, { headers: corsHeaders });
                }
                break;

            case 'DELETE':
                if (path === 'data') {
                    const key = req.query.key;
                    const success = setData(key, null);
                    return res.status(200).json({ success }, { headers: corsHeaders });
                }
                break;

            default:
                return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' }, { headers: corsHeaders });
    }
}

// Export for different serverless platforms
if (typeof module !== 'undefined' && module.exports) {
    module.exports = handler;
}

// Demo data for InfoValidator
function loadDemoData() {
    const demoSubmissions = [
        {
            id: 1,
            sourceName: "AI_Researcher_001",
            targetType: "ai-system",
            instanceId: "ChatGPT-4 System Prompt",
            targetUrl: "https://chat.openai.com",
            requiresLogin: true,
            requiresPaid: true,
            accessNotes: "Plus subscription required",
            leakContent: "You are ChatGPT, a large language model trained by OpenAI. You are helpful, harmless, and honest. You can engage in conversations, answer questions, and assist with various tasks. You should be direct and concise in your responses.",
            context: "Obtained through prompt injection techniques",
            toolPrompts: "",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            confidence: 95,
            isFirstDiscovery: true,
            verificationCount: 3
        },
        {
            id: 2,
            sourceName: "CodeHunter_2024",
            targetType: "code-snippet",
            instanceId: "Bitcoin Mining Algorithm Core",
            targetUrl: "https://github.com/bitcoin/bitcoin",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "Open source repository",
            leakContent: "SHA256(SHA256(version + prev_hash + merkle_root + timestamp + difficulty + nonce))",
            context: "Extracted from Bitcoin Core source code",
            toolPrompts: "",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            confidence: 98,
            isFirstDiscovery: true,
            verificationCount: 5
        },
        {
            id: 3,
            sourceName: "DataScientist_Pro",
            targetType: "data-fact",
            instanceId: "Global Population Dataset 2024",
            targetUrl: "https://data.worldbank.org",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "Public dataset",
            leakContent: "World population: 8.1 billion (2024 estimate). Top countries: China (1.4B), India (1.4B), USA (340M), Indonesia (280M), Pakistan (240M)",
            context: "Compiled from UN World Population Prospects",
            toolPrompts: "",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            confidence: 92,
            isFirstDiscovery: false,
            verificationCount: 2
        },
        {
            id: 4,
            sourceName: "DocumentDigger",
            targetType: "document",
            instanceId: "US Constitution Full Text",
            targetUrl: "https://www.archives.gov/founding-docs",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "Public domain document",
            leakContent: "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.",
            context: "Official government archive",
            toolPrompts: "",
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            confidence: 100,
            isFirstDiscovery: false,
            verificationCount: 8
        },
        {
            id: 5,
            sourceName: "APIMaster_2024",
            targetType: "api",
            instanceId: "OpenAI API Rate Limits",
            targetUrl: "https://platform.openai.com/docs",
            requiresLogin: true,
            requiresPaid: true,
            accessNotes: "API key required",
            leakContent: "Rate limits: GPT-4: 10 requests/minute, GPT-3.5: 60 requests/minute. Token limits: GPT-4: 8,192 tokens, GPT-3.5: 4,096 tokens",
            context: "From official API documentation",
            toolPrompts: "",
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            confidence: 97,
            isFirstDiscovery: true,
            verificationCount: 4
        },
        {
            id: 6,
            sourceName: "VisualVerifier",
            targetType: "image",
            instanceId: "Mars Rover Perseverance Images",
            targetUrl: "https://mars.nasa.gov/msl",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "NASA public gallery",
            leakContent: "High-resolution images from Jezero Crater showing sedimentary rock layers, potential signs of ancient water flow, and organic compounds detected by SHERLOC instrument",
            context: "NASA mission data release",
            toolPrompts: "",
            timestamp: new Date(Date.now() - 518400000).toISOString(),
            confidence: 99,
            isFirstDiscovery: false,
            verificationCount: 6
        }
    ];

    const demoRequests = [
        {
            id: 1,
            targetType: "ai-system",
            model: "Claude-3 Opus System Prompt",
            url: "https://claude.ai",
            description: "Anthropic's latest model system prompt would be valuable for understanding their safety approach",
            requiresLogin: true,
            requiresPaid: true,
            bounty: 1000,
            votes: 15,
            submittedBy: "AI_Researcher_001",
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            targetType: "code-snippet",
            model: "Google's PageRank Algorithm",
            url: "https://patents.google.com",
            description: "The original PageRank implementation details would help understand search ranking",
            requiresLogin: false,
            requiresPaid: false,
            bounty: 500,
            votes: 8,
            submittedBy: "CodeHunter_2024",
            timestamp: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 3,
            targetType: "data-fact",
            model: "Global Internet Usage Statistics 2024",
            url: "https://www.internetworldstats.com",
            description: "Current internet penetration rates and usage patterns by region",
            requiresLogin: false,
            requiresPaid: false,
            bounty: 300,
            votes: 12,
            submittedBy: "DataScientist_Pro",
            timestamp: new Date(Date.now() - 259200000).toISOString()
        }
    ];

    // Load demo data into database
    window.LeakHubDB.setLeakDatabase(demoSubmissions);
    window.LeakHubDB.setLeakRequests(demoRequests);
    
    // Initialize some user stats
    const demoUserStats = {
        "AI_Researcher_001": {
            submissions: 1,
            firstDiscoveries: 1,
            verifications: 3,
            comparisons: 5,
            challengesCompleted: 2,
            requestsSubmitted: 1,
            totalScore: 850
        },
        "CodeHunter_2024": {
            submissions: 1,
            firstDiscoveries: 1,
            verifications: 5,
            comparisons: 8,
            challengesCompleted: 1,
            requestsSubmitted: 1,
            totalScore: 1200
        },
        "DataScientist_Pro": {
            submissions: 1,
            firstDiscoveries: 0,
            verifications: 2,
            comparisons: 3,
            challengesCompleted: 0,
            requestsSubmitted: 1,
            totalScore: 450
        }
    };
    
    window.LeakHubDB.setUserStats(demoUserStats);
    
    // Initialize daily challenge
    const dailyChallenge = {
        title: "Find and verify a system prompt from any AI model!",
        description: "Submit a verified AI system prompt with confidence score above 90%",
        reward: 500,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        completedBy: []
    };
    
    window.LeakHubDB.setDailyChallenge(dailyChallenge);
    
    console.log("Demo data loaded successfully!");
    showAlert("Demo data loaded! Try submitting claims, comparing them, and exploring the platform.", "success");
    
    // Refresh the UI
    if (typeof displaySubmissions === 'function') {
        displaySubmissions();
    }
    if (typeof displayRequests === 'function') {
        displayRequests();
    }
    if (typeof updateStats === 'function') {
        updateStats();
    }
}

function clearDemoData() {
    window.LeakHubDB.setLeakDatabase([]);
    window.LeakHubDB.setLeakRequests([]);
    window.LeakHubDB.setUserStats({});
    window.LeakHubDB.setDailyChallenge(null);
    
    console.log("Demo data cleared!");
    showAlert("Demo data cleared! Start fresh with your own submissions.", "info");
    
    // Refresh the UI
    if (typeof displaySubmissions === 'function') {
        displaySubmissions();
    }
    if (typeof displayRequests === 'function') {
        displayRequests();
    }
    if (typeof updateStats === 'function') {
        updateStats();
    }
}

// Auto-load demo data if no submissions exist
window.addEventListener('load', async () => {
    try {
        const submissions = await window.LeakHubDB.getLeakDatabase();
        if (!submissions || submissions.length === 0) {
            console.log("No submissions found, loading demo data...");
            loadDemoData();
        }
    } catch (error) {
        console.error("Error checking for demo data:", error);
    }
});

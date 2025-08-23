// Demo data for InfoValidator
function loadDemoData() {
    const demoSubmissions = [
        {
            id: 1,
            sourceName: "CodeValidator_42",
            targetType: "ai-system",
            instanceId: "ChatGPT-4 System Prompt",
            targetUrl: "https://chat.openai.com",
            requiresLogin: true,
            requiresPaid: true,
            accessNotes: "Plus subscription required",
            leakContent: "You are ChatGPT, a large language model trained by OpenAI. You are helpful, creative, clever, and very friendly. You respond in a conversational manner and provide detailed, accurate, and helpful responses.",
            context: "Obtained through prompt injection techniques",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            confidence: 85,
            isFirstDiscovery: true,
            verificationCount: 3
        },
        {
            id: 2,
            sourceName: "DataHunter",
            targetType: "code-snippet",
            instanceId: "Bitcoin Mining Algorithm",
            targetUrl: "https://github.com/bitcoin/bitcoin",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "Open source",
            leakContent: `function mineBlock(blockData, targetDifficulty) {
    let nonce = 0;
    let hash = '';
    
    while (true) {
        const blockHeader = blockData + nonce;
        hash = sha256(blockHeader);
        
        if (hash.startsWith('0'.repeat(targetDifficulty))) {
            return { nonce, hash };
        }
        nonce++;
    }
}`,
            context: "Extracted from Bitcoin Core source code",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            confidence: 95,
            isFirstDiscovery: true,
            verificationCount: 5
        },
        {
            id: 3,
            sourceName: "FactChecker_Pro",
            targetType: "data-fact",
            instanceId: "Global Population 2024",
            targetUrl: "https://www.worldometers.info/world-population/",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "Public data",
            leakContent: "8,019,876,189 people (as of January 2024)",
            context: "Verified through multiple official sources",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            confidence: 98,
            isFirstDiscovery: false,
            verificationCount: 12
        },
        {
            id: 4,
            sourceName: "DocAnalyzer",
            targetType: "document",
            instanceId: "US Constitution Preamble",
            targetUrl: "https://www.archives.gov/founding-docs/constitution",
            requiresLogin: false,
            requiresPaid: false,
            accessNotes: "Public domain document",
            leakContent: "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.",
            context: "Official government document",
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            confidence: 100,
            isFirstDiscovery: false,
            verificationCount: 25
        },
        {
            id: 5,
            sourceName: "APIScout",
            targetType: "api",
            instanceId: "GitHub API Rate Limits",
            targetUrl: "https://docs.github.com/en/rest/overview/rate-limits",
            requiresLogin: true,
            requiresPaid: false,
            accessNotes: "GitHub account required",
            leakContent: "Authenticated requests: 5,000 requests per hour\nUnauthenticated requests: 60 requests per hour",
            context: "From official GitHub API documentation",
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            confidence: 92,
            isFirstDiscovery: true,
            verificationCount: 8
        },
        {
            id: 6,
            sourceName: "AIVerifier",
            targetType: "ai-system",
            instanceId: "Claude-3 System Prompt",
            targetUrl: "https://claude.ai",
            requiresLogin: true,
            requiresPaid: true,
            accessNotes: "Claude Pro subscription required",
            leakContent: "You are Claude, an AI assistant created by Anthropic. You are helpful, harmless, and honest. You aim to provide accurate and useful information while being transparent about your capabilities and limitations.",
            context: "Obtained through conversation analysis",
            timestamp: new Date(Date.now() - 518400000).toISOString(),
            confidence: 78,
            isFirstDiscovery: true,
            verificationCount: 2
        }
    ];

    const demoRequests = [
        {
            id: 1,
            targetType: "ai-system",
            model: "Gemini Ultra System Prompt",
            url: "https://gemini.google.com",
            description: "Need to verify the system prompt for Google's Gemini Ultra model. This would be valuable for understanding Google's AI safety approach.",
            requiresLogin: true,
            requiresPaid: true,
            bounty: 750,
            votes: 15,
            submittedBy: "AIResearcher",
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            targetType: "code-snippet",
            model: "OpenAI Whisper Algorithm",
            url: "https://github.com/openai/whisper",
            description: "Looking for the core speech recognition algorithm used in Whisper. This could help understand modern speech-to-text technology.",
            requiresLogin: false,
            requiresPaid: false,
            bounty: 500,
            votes: 8,
            submittedBy: "SpeechTech",
            timestamp: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 3,
            targetType: "data-fact",
            model: "Global Internet Users 2024",
            url: "https://www.internetworldstats.com",
            description: "Need to verify the current number of global internet users. This data is crucial for digital inclusion research.",
            requiresLogin: false,
            requiresPaid: false,
            bounty: 200,
            votes: 12,
            submittedBy: "DigitalAnalyst",
            timestamp: new Date(Date.now() - 259200000).toISOString()
        }
    ];

    const demoUserStats = {
        "CodeValidator_42": {
            submissions: 3,
            firstDiscoveries: 2,
            verifications: 8,
            comparisons: 15,
            challengesCompleted: 1,
            requestsSubmitted: 2,
            totalScore: 1250,
            joinDate: new Date(Date.now() - 2592000000).toISOString()
        },
        "DataHunter": {
            submissions: 5,
            firstDiscoveries: 3,
            verifications: 12,
            comparisons: 22,
            challengesCompleted: 2,
            requestsSubmitted: 1,
            totalScore: 2100,
            joinDate: new Date(Date.now() - 3456000000).toISOString()
        },
        "FactChecker_Pro": {
            submissions: 8,
            firstDiscoveries: 1,
            verifications: 25,
            comparisons: 18,
            challengesCompleted: 3,
            requestsSubmitted: 4,
            totalScore: 1800,
            joinDate: new Date(Date.now() - 4320000000).toISOString()
        },
        "DocAnalyzer": {
            submissions: 2,
            firstDiscoveries: 0,
            verifications: 15,
            comparisons: 8,
            challengesCompleted: 1,
            requestsSubmitted: 1,
            totalScore: 950,
            joinDate: new Date(Date.now() - 5184000000).toISOString()
        },
        "APIScout": {
            submissions: 4,
            firstDiscoveries: 2,
            verifications: 10,
            comparisons: 12,
            challengesCompleted: 2,
            requestsSubmitted: 3,
            totalScore: 1400,
            joinDate: new Date(Date.now() - 6048000000).toISOString()
        }
    };

    // Load demo data into the database
    if (window.LeakHubDB) {
        window.LeakHubDB.setLeakDatabase(demoSubmissions).then(() => {
            console.log('Demo submissions loaded');
        });
        
        window.LeakHubDB.setLeakRequests(demoRequests).then(() => {
            console.log('Demo requests loaded');
        });
        
        window.LeakHubDB.setUserStats(demoUserStats).then(() => {
            console.log('Demo user stats loaded');
        });
        
        // Set daily challenge
        const challenge = {
            title: "AI System Prompt Hunt",
            description: "Find and verify a system prompt from any AI model!",
            reward: 500,
            endTime: new Date(Date.now() + 86400000).toISOString(),
            completedBy: []
        };
        
        window.LeakHubDB.setDailyChallenge(challenge).then(() => {
            console.log('Demo daily challenge loaded');
        });
    }

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
    
    showAlert('Demo data loaded successfully! 🎉', 'success');
}

function clearDemoData() {
    if (window.LeakHubDB) {
        window.LeakHubDB.setLeakDatabase([]).then(() => {
            console.log('Demo submissions cleared');
        });
        
        window.LeakHubDB.setLeakRequests([]).then(() => {
            console.log('Demo requests cleared');
        });
        
        window.LeakHubDB.setUserStats({}).then(() => {
            console.log('Demo user stats cleared');
        });
        
        window.LeakHubDB.setDailyChallenge(null).then(() => {
            console.log('Demo daily challenge cleared');
        });
    }

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
    
    showAlert('Demo data cleared! 🗑️', 'info');
}

// Add demo data buttons to the page
function addDemoButtons() {
    const container = document.querySelector('.container');
    if (container) {
        const demoSection = document.createElement('div');
        demoSection.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.8);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 10px;
            backdrop-filter: blur(10px);
        `;
        
        demoSection.innerHTML = `
            <div style="color: #00ff88; font-size: 0.9rem; margin-bottom: 8px;">🧪 Demo Tools</div>
            <button onclick="loadDemoData()" style="
                background: #00ff88;
                color: #000;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                margin-right: 5px;
            ">Load Demo</button>
            <button onclick="clearDemoData()" style="
                background: #ff4444;
                color: #fff;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
            ">Clear</button>
        `;
        
        container.appendChild(demoSection);
    }
}

// Auto-add demo buttons when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDemoButtons);
} else {
    addDemoButtons();
}

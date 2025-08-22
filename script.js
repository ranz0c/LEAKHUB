// LeakHub Database and State Management
let leakDatabase = [];
let selectedSubmissions = new Set();
let userStats = {};
let leakRequests = [];
let userVotes = {};
let dailyChallenge = null;

// Dynamic Achievement System
const achievements = {
    firstBlood: { id: 'firstBlood', name: 'First Blood', description: 'Submit your first leak', icon: '🩸', points: 50, unlocked: false },
    discoverer: { id: 'discoverer', name: 'Discoverer', description: 'Make your first discovery', icon: '🔍', points: 100, unlocked: false },
    verifier: { id: 'verifier', name: 'Verifier', description: 'Verify 5 submissions', icon: '✅', points: 200, unlocked: false },
    collector: { id: 'collector', name: 'Collector', description: 'Submit 10 different leaks', icon: '📚', points: 300, unlocked: false },
    expert: { id: 'expert', name: 'Expert', description: 'Reach 1000 total points', icon: '👑', points: 500, unlocked: false },
    pioneer: { id: 'pioneer', name: 'Pioneer', description: 'Discover 5 different targets', icon: '🚀', points: 400, unlocked: false },
    analyst: { id: 'analyst', name: 'Analyst', description: 'Perform 20 comparisons', icon: '📊', points: 250, unlocked: false },
    challenger: { id: 'challenger', name: 'Challenger', description: 'Complete 5 daily challenges', icon: '🎯', points: 350, unlocked: false },
    community: { id: 'community', name: 'Community Hero', description: 'Submit 10 requests', icon: '🤝', points: 200, unlocked: false },
    legend: { id: 'legend', name: 'LeakHub Legend', description: 'Unlock all achievements', icon: '🌟', points: 1000, unlocked: false }
};

let userAchievements = {};

// Initialize database and UI
async function initializeApp() {
    try {
        // Wait for database to be ready
        await window.LeakHubDB.init();
        
        // Load data from database
        leakDatabase = await window.LeakHubDB.getLeakDatabase();
        userStats = await window.LeakHubDB.getUserStats();
        leakRequests = await window.LeakHubDB.getLeakRequests();
        userVotes = await window.LeakHubDB.getUserVotes();
        dailyChallenge = await window.LeakHubDB.getDailyChallenge();
        
        // Initialize UI and production features
        updateUI();
        initializeDailyChallenge();
        startChallengeTimer();
        initializeProductionFeatures();
        
        console.log('LeakHub initialized successfully');
    } catch (error) {
        console.error('Error initializing LeakHub:', error);
        // Fallback to localStorage if database fails
        leakDatabase = JSON.parse(localStorage.getItem('leakDatabase') || '[]');
        userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
        leakRequests = JSON.parse(localStorage.getItem('leakRequests') || '[]');
        userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
        dailyChallenge = JSON.parse(localStorage.getItem('dailyChallenge') || 'null');
        
        updateUI();
        initializeDailyChallenge();
        startChallengeTimer();
        initializeProductionFeatures();
    }
}

// Start the app
initializeApp();

function submitLeak(event) {
    event.preventDefault();
    
    const source = document.getElementById('sourceName').value;
    const submission = {
        id: Date.now().toString(),
        source: source,
        targetType: document.getElementById('targetType').value,
        instance: document.getElementById('instanceId').value,
        targetUrl: document.getElementById('targetUrl').value || null,
        requiresLogin: document.getElementById('requiresLogin').checked,
        requiresPaid: document.getElementById('requiresPaid').checked,
        accessNotes: document.getElementById('accessNotes').value || null,
        parentSystem: document.getElementById('parentSystem').value || null,
        functionName: document.getElementById('functionName').value || null,
        content: document.getElementById('leakContent').value,
        toolPrompts: document.getElementById('toolPrompts').value || null,
        context: document.getElementById('context').value,
        timestamp: new Date().toISOString(),
        verifications: 0,
        confidence: 0,
        isFirstDiscovery: false,
        hasTools: document.getElementById('hasTools').checked
    };
    
    // Calculate initial confidence based on content
    submission.confidence = calculateInitialConfidence(submission.content);
    
    // Check if this is the first discovery for this specific target
    const targetKey = `${submission.targetType}:${submission.instance}${submission.functionName ? ':' + submission.functionName : ''}`;
    const existingForTarget = leakDatabase.filter(sub => {
        const subKey = `${sub.targetType}:${sub.instance}${sub.functionName ? ':' + sub.functionName : ''}`;
        return subKey === targetKey;
    });
    
    if (existingForTarget.length === 0) {
        submission.isFirstDiscovery = true;
    }
    
    leakDatabase.push(submission);
    
    // Update user stats
    if (!userStats[source]) {
        userStats[source] = {
            submissions: 0,
            verifiedLeaks: 0,
            firstDiscoveries: 0,
            totalScore: 0,
            joinDate: new Date().toISOString(),
            toolsDiscovered: 0,
            appsDiscovered: 0,
            agentsDiscovered: 0,
            comparisons: 0,
            challengesCompleted: 0,
            requestsSubmitted: 0
        };
    }
    
    userStats[source].submissions++;
    if (submission.isFirstDiscovery) {
        userStats[source].firstDiscoveries++;
        userStats[source].totalScore += 100; // 100 points for first discovery
        
        // Extra points for discovering non-model targets
        if (submission.targetType !== 'model') {
            userStats[source].totalScore += 50; // Bonus for diversity
        }
        
        // Track specific discovery types
        if (submission.targetType === 'tool') userStats[source].toolsDiscovered++;
        if (submission.targetType === 'app') userStats[source].appsDiscovered++;
        if (submission.targetType === 'agent') userStats[source].agentsDiscovered++;
    }
    userStats[source].totalScore += 10; // 10 points for any submission
    
    // Bonus points for tool prompts
    if (submission.hasTools && submission.toolPrompts) {
        userStats[source].totalScore += 30; // Extra points for comprehensive submission
    }
    
    saveDatabase().then(() => {
        updateUI();
        
        // Clear form
        document.getElementById('sourceName').value = '';
        document.getElementById('targetType').value = '';
        document.getElementById('instanceId').value = '';
        document.getElementById('targetUrl').value = '';
        document.getElementById('requiresLogin').checked = false;
        document.getElementById('requiresPaid').checked = false;
        document.getElementById('accessNotes').value = '';
        document.getElementById('parentSystem').value = '';
        document.getElementById('functionName').value = '';
        document.getElementById('leakContent').value = '';
        document.getElementById('toolPrompts').value = '';
        document.getElementById('context').value = '';
        document.getElementById('hasTools').checked = false;
        document.getElementById('additionalFields').style.display = 'none';
        document.getElementById('toolsSection').style.display = 'none';
        
        showAlert('Leak submitted successfully!');
    });
    
    showAlert(submission.isFirstDiscovery ? 
        '🎉 First discovery! You found a new leak!' : 
        'Leak submitted successfully!');
    
    // Check for daily challenge completion
    checkDailyChallengeCompletion(submission);
}

function updateTargetFields() {
    const targetType = document.getElementById('targetType').value;
    const additionalFields = document.getElementById('additionalFields');
    const instancePlaceholder = document.getElementById('instanceId');
    
    if (targetType === 'tool' || targetType === 'plugin') {
        additionalFields.style.display = 'block';
        instancePlaceholder.placeholder = 'Tool/Plugin name (e.g., Code Interpreter, WebPilot)';
    } else if (targetType === 'agent') {
        additionalFields.style.display = 'block';
        instancePlaceholder.placeholder = 'Agent name (e.g., AutoGPT, BabyAGI)';
    } else if (targetType === 'app') {
        additionalFields.style.display = 'none';
        instancePlaceholder.placeholder = 'App name (e.g., Cursor, GitHub Copilot)';
    } else if (targetType === 'custom') {
        additionalFields.style.display = 'block';
        instancePlaceholder.placeholder = 'Custom GPT/Bot name';
    } else {
        additionalFields.style.display = 'none';
        instancePlaceholder.placeholder = 'Model name (e.g., GPT-4, Claude-3)';
    }
}

function toggleToolsSection() {
    const toolsSection = document.getElementById('toolsSection');
    const hasTools = document.getElementById('hasTools').checked;
    toolsSection.style.display = hasTools ? 'block' : 'none';
}

function calculateInitialConfidence(content) {
    // Simple heuristics for initial confidence
    let confidence = 50; // Base confidence
    
    // Check for common system prompt patterns
    if (content.includes('You are') || content.includes('Your purpose')) confidence += 10;
    if (content.includes('instructions') || content.includes('guidelines')) confidence += 10;
    if (content.includes('Do not') || content.includes('Never')) confidence += 10;
    if (content.length > 500) confidence += 10;
    if (content.includes('\n') && content.split('\n').length > 5) confidence += 10;
    
    return Math.min(confidence, 90); // Cap at 90% until verified
}

function updateUI() {
    updateSubmissionsList();
    updateStatistics();
    updateSelectors();
}

function updateSubmissionsList() {
    const list = document.getElementById('submissionsList');
    
    if (leakDatabase.length === 0) {
        list.innerHTML = '<p style="color: #666; text-align: center;">No submissions yet. Be the first to contribute!</p>';
        return;
    }
    
    // Group by target type and instance
    const grouped = leakDatabase.reduce((acc, submission) => {
        const targetType = submission.targetType || 'model'; // Backwards compatibility
        const typeEmoji = {
            'model': '🤖 ',
            'app': '📱 ',
            'tool': '🔧 ',
            'agent': '🤝 ',
            'plugin': '🔌 ',
            'custom': '🛠️ '
        }[targetType] || '📄 ';
        
        const groupKey = `${typeEmoji} ${submission.instance}`;
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(submission);
        return acc;
    }, {});
    
    list.innerHTML = Object.entries(grouped).map(([groupName, submissions]) => `
        <div style="margin-bottom: 2rem;">
            <h4 style="color: #00aaff; margin-bottom: 1rem;">${groupName} (${submissions.length} submissions)</h4>
            ${submissions.map(sub => {
                const targetInfo = sub.functionName ? 
                    `<span style="color: #ff9933; font-size: 0.8rem;">→ ${sub.functionName}</span>` : '';
                const parentInfo = sub.parentSystem ? 
                    `<span style="color: #666; font-size: 0.8rem;">(${sub.parentSystem})</span>` : '';
                const toolsBadge = sub.hasTools ? 
                    '<span style="background: rgba(255,153,51,0.2); color: #ff9933; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.5rem;">+tools</span>' : '';
                
                // Access badges
                const accessBadges = [];
                if (sub.requiresLogin) accessBadges.push('<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.3rem;">🔒</span>');
                if (sub.requiresPaid) accessBadges.push('<span style="background: rgba(255,215,0,0.2); color: #ffd700; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.3rem;">💰</span>');
                
                const linkButton = sub.targetUrl ? 
                    `<a href="${sub.targetUrl}" target="_blank" style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,170,255,0.2); color: #00aaff; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.7rem; text-decoration: none; border: 1px solid rgba(0,170,255,0.3);" onclick="event.stopPropagation();">🔗 Visit</a>` : '';
                
                return `
                    <div class="submission-item ${selectedSubmissions.has(sub.id) ? 'selected' : ''}" 
                         onclick="toggleSelection('${sub.id}')"
                         data-id="${sub.id}"
                         style="position: relative;">
                        ${linkButton}
                        <div class="submission-header">
                            <span class="submission-source">${sub.source} ${parentInfo}</span>
                            <span class="submission-date">${new Date(sub.timestamp).toLocaleDateString()}</span>
                        </div>
                        ${targetInfo}
                        <div class="submission-preview">${sub.content.substring(0, 100)}...</div>
                        ${sub.accessNotes ? `<div style="color: #666; font-size: 0.8rem; margin-top: 0.3rem;">📋 ${sub.accessNotes}</div>` : ''}
                        <div class="submission-confidence">${sub.confidence}%</div>
                        <div style="position: absolute; bottom: 0.5rem; right: 0.5rem;">
                            ${toolsBadge}${accessBadges.join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `).join('');
}

function updateStatistics() {
    // Count unique targets by type
    const targetCounts = leakDatabase.reduce((acc, sub) => {
        const targetType = sub.targetType || 'model';
        const key = `${targetType}:${sub.instance}`;
        acc.add(key);
        return acc;
    }, new Set());
    
    document.getElementById('activeLeaks').textContent = targetCounts.size;
    document.getElementById('totalSubmissions').textContent = leakDatabase.length;
    
    const verified = leakDatabase.filter(sub => sub.confidence >= 90).length;
    document.getElementById('verifiedPrompts').textContent = verified;
    
    document.getElementById('uniqueInstances').textContent = targetCounts.size;
    
    // Calculate average similarity from recent comparisons
    const avgSim = localStorage.getItem('avgSimilarity') || '0';
    document.getElementById('avgSimilarity').textContent = avgSim + '%';
    
    const highConf = leakDatabase.filter(sub => sub.confidence >= 80).length;
    document.getElementById('highConfidence').textContent = highConf;
}

function updateSelectors() {
    const selectA = document.getElementById('instanceA');
    const selectB = document.getElementById('instanceB');
    
    const options = '<option value="">Select submission...</option>' + 
        leakDatabase.map(sub => {
            const targetType = sub.targetType || 'model';
            const typeLabel = targetType.charAt(0).toUpperCase() + targetType.slice(1);
            const fullName = sub.functionName ? 
                `${sub.instance} → ${sub.functionName}` : sub.instance;
            return `<option value="${sub.id}">[${typeLabel}] ${fullName} - ${sub.source} (${new Date(sub.timestamp).toLocaleDateString()})</option>`;
        }).join('');
    
    selectA.innerHTML = options;
    selectB.innerHTML = options;
}

function toggleSelection(id) {
    if (selectedSubmissions.has(id)) {
        selectedSubmissions.delete(id);
    } else {
        selectedSubmissions.add(id);
    }
    updateUI();
}

function compareInstances() {
    const idA = document.getElementById('instanceA').value;
    const idB = document.getElementById('instanceB').value;
    
    if (!idA || !idB || idA === idB) {
        showAlert('Please select two different submissions to compare');
        return;
    }
    
    const subA = leakDatabase.find(sub => sub.id === idA);
    const subB = leakDatabase.find(sub => sub.id === idB);
    
    performComparison(subA, subB);
}

function performComparison(subA, subB) {
    document.getElementById('comparisonResults').style.display = 'block';
    
    // Display content
    document.getElementById('instanceAContent').textContent = subA.content;
    document.getElementById('instanceBContent').textContent = subB.content;
    
    // Normalize texts for comparison (remove extra whitespace, lowercase for some checks)
    const normA = normalizeText(subA.content);
    const normB = normalizeText(subB.content);
    
    // Calculate metrics
    const charMatch = calculateCharMatch(normA, normB);
    const wordMatch = calculateWordMatch(normA, normB);
    const structureMatch = calculateStructureMatch(subA.content, subB.content);
    const coreSimilarity = calculateCoreSimilarity(normA, normB);
    
    // Update UI
    document.getElementById('charMatch').textContent = charMatch + '%';
    document.getElementById('wordMatch').textContent = wordMatch + '%';
    document.getElementById('structureMatch').textContent = structureMatch + '%';
    document.getElementById('coreSimilarity').textContent = coreSimilarity + '%';
    
    // Generate consensus view
    generateConsensusView(subA.content, subB.content);
    
    // Update average similarity
    const avgSim = Math.round((charMatch + wordMatch + structureMatch + coreSimilarity) / 4);
    localStorage.setItem('avgSimilarity', avgSim.toString());
    
    // Update confidence scores if high match
    if (coreSimilarity > 85) {
        subA.confidence = Math.min(100, subA.confidence + 5);
        subB.confidence = Math.min(100, subB.confidence + 5);
        subA.verifications++;
        subB.verifications++;
        
        // Award points for verification
        if (userStats[subA.source]) {
            userStats[subA.source].totalScore += 20; // 20 points for verification
            if (subA.confidence >= 95 && !subA.wasVerified) {
                userStats[subA.source].verifiedLeaks++;
                userStats[subA.source].totalScore += 50; // Bonus for reaching verified status
                subA.wasVerified = true;
            }
        }
        if (userStats[subB.source]) {
            userStats[subB.source].totalScore += 20;
            if (subB.confidence >= 95 && !subB.wasVerified) {
                userStats[subB.source].verifiedLeaks++;
                userStats[subB.source].totalScore += 50;
                subB.wasVerified = true;
            }
        }
        
        saveDatabase().then(() => {
            updateUI();
        });
    }
    
    // Scroll to results
    document.getElementById('comparisonResults').scrollIntoView({ behavior: 'smooth' });
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
}

function calculateCharMatch(textA, textB) {
    const longer = textA.length > textB.length ? textA : textB;
    const shorter = textA.length > textB.length ? textB : textA;
    
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (shorter[i] === longer[i]) matches++;
    }
    
    return Math.round((matches / longer.length) * 100);
}

function calculateWordMatch(textA, textB) {
    const wordsA = new Set(textA.split(' '));
    const wordsB = new Set(textB.split(' '));
    
    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);
    
    return Math.round((intersection.size / union.size) * 100);
}

function calculateStructureMatch(textA, textB) {
    // Compare line counts, paragraph structure, etc.
    const linesA = textA.split('\n').filter(l => l.trim());
    const linesB = textB.split('\n').filter(l => l.trim());
    
    const lineRatio = Math.min(linesA.length, linesB.length) / Math.max(linesA.length, linesB.length);
    
    // Check for similar patterns (numbered lists, bullet points, etc.)
    const hasNumbersA = /^\d+\./.test(textA);
    const hasNumbersB = /^\d+\./.test(textB);
    const hasBulletsA = /^[-*•]/.test(textA);
    const hasBulletsB = /^[-*•]/.test(textB);
    
    let structureScore = lineRatio * 50;
    if (hasNumbersA === hasNumbersB) structureScore += 25;
    if (hasBulletsA === hasBulletsB) structureScore += 25;
    
    return Math.round(structureScore);
}

function calculateCoreSimilarity(textA, textB) {
    // Use a simple sliding window approach to find common phrases
    const minPhraseLength = 10;
    const commonPhrases = [];
    
    for (let i = 0; i <= textA.length - minPhraseLength; i++) {
        for (let len = minPhraseLength; len <= 50 && i + len <= textA.length; len++) {
            const phrase = textA.substring(i, i + len);
            if (textB.includes(phrase)) {
                commonPhrases.push(phrase);
            }
        }
    }
    
    // Remove overlapping phrases
    const uniquePhrases = commonPhrases.filter((phrase, index) => {
        return !commonPhrases.some((other, otherIndex) => 
            otherIndex !== index && other.includes(phrase) && other.length > phrase.length
        );
    });
    
    const commonLength = uniquePhrases.reduce((sum, phrase) => sum + phrase.length, 0);
    const avgLength = (textA.length + textB.length) / 2;
    
    return Math.round((commonLength / avgLength) * 100);
}

function generateConsensusView(textA, textB) {
    const consensusDiv = document.getElementById('consensusText');
    
    // Find common lines/sections
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');
    
    let consensus = [];
    
    linesA.forEach(lineA => {
        const trimmedA = lineA.trim();
        if (!trimmedA) return;
        
        const matchingLine = linesB.find(lineB => {
            const trimmedB = lineB.trim();
            // Allow for minor differences
            return trimmedB && (
                trimmedA === trimmedB ||
                similarity(trimmedA.toLowerCase(), trimmedB.toLowerCase()) > 0.8
            );
        });
        
        if (matchingLine) {
            consensus.push(`<span class="highlight-match">${trimmedA}</span>`);
        }
    });
    
    if (consensus.length > 0) {
        consensusDiv.innerHTML = consensus.join('\n');
    } else {
        consensusDiv.innerHTML = '<span style="color: #666;">No exact line matches found. Consider checking word-level similarities above.</span>';
    }
}

function similarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

async function saveDatabase() {
    try {
        await window.LeakHubDB.setLeakDatabase(leakDatabase);
        await window.LeakHubDB.setUserStats(userStats);
        await window.LeakHubDB.setLeakRequests(leakRequests);
        await window.LeakHubDB.setUserVotes(userVotes);
        await window.LeakHubDB.setDailyChallenge(dailyChallenge);
        
        // Also save to localStorage as backup
        localStorage.setItem('leakDatabase', JSON.stringify(leakDatabase));
        localStorage.setItem('userStats', JSON.stringify(userStats));
        localStorage.setItem('leakRequests', JSON.stringify(leakRequests));
        localStorage.setItem('userVotes', JSON.stringify(userVotes));
        localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
    } catch (error) {
        console.error('Error saving to database:', error);
        // Fallback to localStorage only
        localStorage.setItem('leakDatabase', JSON.stringify(leakDatabase));
        localStorage.setItem('userStats', JSON.stringify(userStats));
        localStorage.setItem('leakRequests', JSON.stringify(leakRequests));
        localStorage.setItem('userVotes', JSON.stringify(userVotes));
        localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
    }
}

function showAlert(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Leaderboard functions
function toggleLeaderboard() {
    const overlay = document.getElementById('leaderboardOverlay');
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    if (overlay.style.display === 'block') {
        updateLeaderboard();
    }
}

function switchLeaderboardTab(tab) {
    document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.leaderboard-content').forEach(c => c.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-content`).style.display = 'block';
}

function updateLeaderboard() {
    updateRankings();
    updateAchievements();
    updateTimeline();
}

function updateRankings() {
    const rankingsList = document.getElementById('rankingsList');
    
    // Sort users by total score
    const sortedUsers = Object.entries(userStats)
        .sort((a, b) => b[1].totalScore - a[1].totalScore)
        .slice(0, 10); // Top 10
    
    if (sortedUsers.length === 0) {
        rankingsList.innerHTML = '<p style="color: #666; text-align: center;">No contributors yet!</p>';
        return;
    }
    
    rankingsList.innerHTML = sortedUsers.map(([username, stats], index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        
        return `
            <div class="rank-item">
                <div class="rank-number ${rankClass}">${rankEmoji}</div>
                <div class="rank-user">
                    <div class="rank-username">${username}</div>
                    <div class="rank-stats">
                        <span>📤 ${stats.submissions} submissions</span>
                        <span>✅ ${stats.verifiedLeaks} verified</span>
                        <span>🎯 ${stats.firstDiscoveries} first discoveries</span>
                    </div>
                </div>
                <div class="rank-score">${stats.totalScore} pts</div>
            </div>
        `;
    }).join('');
}

function updateAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    const unlockedAchievements = displayAchievements(localStorage.getItem('currentUser'));
    
    if (unlockedAchievements.length === 0) {
        achievementsList.innerHTML = '<p style="color: #666; text-align: center;">No achievements yet!</p>';
        return;
    }
    
    achievementsList.innerHTML = unlockedAchievements.map(achievement => `
        <div class="achievement-card">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.name}</div>
            <p style="color: #666; margin-top: 0.5rem; font-size: 0.9rem;">${achievement.description}</p>
        </div>
    `).join('');
}

function updateTimeline() {
    const timelineList = document.getElementById('timelineList');
    
    // Get significant events
    const events = [];
    
    // First discoveries
    const instanceFirsts = {};
    leakDatabase.forEach(sub => {
        if (sub.isFirstDiscovery && !instanceFirsts[sub.instance]) {
            instanceFirsts[sub.instance] = {
                user: sub.source,
                date: sub.timestamp,
                instance: sub.instance
            };
        }
    });
    
    Object.values(instanceFirsts).forEach(event => {
        events.push({
            date: event.date,
            type: 'discovery',
            text: `${event.user} discovered the first ${event.instance} leak`
        });
    });
    
    // Verification milestones
    leakDatabase.forEach(sub => {
        if (sub.confidence >= 95 && sub.wasVerified) {
            events.push({
                date: sub.timestamp,
                type: 'verification',
                text: `${sub.instance} leak verified by ${sub.source}`
            });
        }
    });
    
    // Sort by date
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (events.length === 0) {
        timelineList.innerHTML = '<p style="color: #666; text-align: center;">No events yet!</p>';
        return;
    }
    
    timelineList.innerHTML = events.slice(0, 20).map(event => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">${new Date(event.date).toLocaleString()}</div>
                <div class="timeline-event">${event.text}</div>
            </div>
        </div>
    `).join('');
}

// Requests & Challenges functions
function toggleRequests() {
    const overlay = document.getElementById('requestsOverlay');
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    if (overlay.style.display === 'block') {
        updateRequestsList();
    }
}

function initializeDailyChallenge() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (!dailyChallenge || new Date(dailyChallenge.expires) < now) {
        // Create new daily challenge
        const challenges = [
            { model: 'GPT-4 Turbo', reward: 500 },
            { model: 'Claude 3 Opus', reward: 600 },
            { model: 'Gemini Ultra', reward: 700 },
            { model: 'Llama 3', reward: 400 },
            { model: 'Mistral Large', reward: 450 }
        ];
        
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        dailyChallenge = {
            model: randomChallenge.model,
            reward: randomChallenge.reward,
            expires: tomorrow.toISOString(),
            completedBy: []
        };
        saveDatabase();
    }
    
    document.getElementById('challengeDescription').textContent = 
        `Find and verify a system prompt from ${dailyChallenge.model}!`;
}

function startChallengeTimer() {
    setInterval(updateChallengeTimer, 1000);
    updateChallengeTimer();
}

function updateChallengeTimer() {
    if (!dailyChallenge) return;
    
    const now = new Date();
    const expires = new Date(dailyChallenge.expires);
    const diff = expires - now;
    
    if (diff <= 0) {
        initializeDailyChallenge();
        return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('challengeTimer').textContent = 
        `Time remaining: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function submitRequest(event) {
    event.preventDefault();
    
    const currentUser = prompt('Enter your username to submit this request:');
    if (!currentUser) return;
    
    const request = {
        id: Date.now().toString(),
        targetType: document.getElementById('requestTargetType').value,
        model: document.getElementById('requestModel').value,
        targetUrl: document.getElementById('requestUrl').value || null,
        requiresLogin: document.getElementById('requestRequiresLogin').checked,
        requiresPaid: document.getElementById('requestRequiresPaid').checked,
        description: document.getElementById('requestDescription').value,
        bounty: parseInt(document.getElementById('requestBounty').value) || 0,
        requestedBy: currentUser,
        timestamp: new Date().toISOString(),
        votes: 0,
        voters: [],
        status: 'open'
    };
    
    leakRequests.push(request);
    saveDatabase().then(() => {
        updateRequestsList();
        
        // Clear form
        document.getElementById('requestModel').value = '';
        document.getElementById('requestDescription').value = '';
        document.getElementById('requestBounty').value = '';
        
        showAlert('Request submitted successfully!');
    });
}

function updateRequestsList() {
    const requestsList = document.getElementById('requestsList');
    const filterType = document.querySelector('.filter-tab.active')?.textContent.includes('Trending') ? 'trending' :
                     document.querySelector('.filter-tab.active')?.textContent.includes('Bounty') ? 'bounty' :
                     document.querySelector('.filter-tab.active')?.textContent.includes('Newest') ? 'new' : 'myvotes';
    
    let filteredRequests = [...leakRequests];
    
    // Apply filters
    switch(filterType) {
        case 'trending':
            filteredRequests.sort((a, b) => b.votes - a.votes);
            break;
        case 'bounty':
            filteredRequests.sort((a, b) => b.bounty - a.bounty);
            break;
        case 'new':
            filteredRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'myvotes':
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser && userVotes[currentUser]) {
                filteredRequests = filteredRequests.filter(req => userVotes[currentUser].includes(req.id));
            }
            break;
    }
    
    if (filteredRequests.length === 0) {
        requestsList.innerHTML = '<p style="color: #666; text-align: center;">No requests found.</p>';
        return;
    }
    
    requestsList.innerHTML = filteredRequests.slice(0, 10).map(request => {
        const currentUser = localStorage.getItem('currentUser');
        const hasVoted = currentUser && userVotes[currentUser] && userVotes[currentUser].includes(request.id);
        const isTrending = request.votes > 5;
        
        const targetType = request.targetType || 'model';
        const typeEmoji = {
            'model': '🤖 ',
            'app': '📱 ',
            'tool': '🔧 ',
            'agent': '🤝 ',
            'plugin': '🔌 ',
            'custom': '🛠️ '
        }[targetType] || '📄 ';
        
        // Access indicators
        const accessInfo = [];
        if (request.requiresLogin) accessInfo.push('🔒');
        if (request.requiresPaid) accessInfo.push('💰');
        const accessString = accessInfo.length > 0 ? ` ${accessInfo.join(' ')}` : '';
        
        const linkIcon = request.targetUrl ? 
            `<a href="${request.targetUrl}" target="_blank" style="text-decoration: none; margin-left: 0.5rem;" onclick="event.stopPropagation();" title="Visit target">🔗</a>` : '';
        
        return `
            <div class="request-item">
                <div class="request-header">
                    <span class="request-model">${typeEmoji} ${request.model}${accessString}${linkIcon}</span>
                    <div class="request-votes">
                        ${isTrending ? '<span class="trending-indicator">🔥 Trending</span>' : ''}
                        <span class="vote-count">${request.votes} votes</span>
                        <button class="vote-button ${hasVoted ? 'voted' : ''}" 
                                onclick="voteForRequest('${request.id}')">
                            ${hasVoted ? 'Voted ✅' : 'Vote'}
                        </button>
                    </div>
                </div>
                ${request.description ? `<p class="request-description">${request.description}</p>` : ''}
                <div class="request-meta">
                    <span>Requested by ${request.requestedBy}</span>
                    ${request.bounty > 0 ? `<span class="bounty-badge">+${request.bounty} bounty</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function voteForRequest(requestId) {
    const currentUser = prompt('Enter your username to vote:');
    if (!currentUser) return;
    
    localStorage.setItem('currentUser', currentUser);
    
    if (!userVotes[currentUser]) {
        userVotes[currentUser] = [];
    }
    
    const request = leakRequests.find(r => r.id === requestId);
    if (!request) return;
    
    if (userVotes[currentUser].includes(requestId)) {
        // Remove vote
        userVotes[currentUser] = userVotes[currentUser].filter(id => id !== requestId);
        request.votes--;
        request.voters = request.voters.filter(v => v !== currentUser);
    } else {
        // Add vote
        userVotes[currentUser].push(requestId);
        request.votes++;
        request.voters.push(currentUser);
    }
    
    saveDatabase();
    updateRequestsList();
}

function filterRequests(type) {
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    updateRequestsList();
}

// Check for daily challenge completion
function checkDailyChallengeCompletion(submission) {
    if (!dailyChallenge || dailyChallenge.completedBy.includes(submission.source)) return;
    
    if (submission.instance === dailyChallenge.model && submission.confidence >= 90) {
        // Challenge completed!
        dailyChallenge.completedBy.push(submission.source);
        
        if (!userStats[submission.source]) {
            userStats[submission.source] = {
                submissions: 0,
                verifiedLeaks: 0,
                firstDiscoveries: 0,
                totalScore: 0,
                joinDate: new Date().toISOString(),
                dailyChallenges: 0
            };
        }
        
        userStats[submission.source].totalScore += dailyChallenge.reward;
        userStats[submission.source].dailyChallenges = (userStats[submission.source].dailyChallenges || 0) + 1;
        
        saveDatabase().then(() => {
            showAlert(`🎯 Daily Challenge Completed! +${dailyChallenge.reward} points!`);
        });
    }
}

// Advanced AI-Powered Similarity Detection
function advancedSimilarityAnalysis(text1, text2) {
    const analysis = {
        semantic: calculateSemanticSimilarity(text1, text2),
        structural: calculateStructuralSimilarity(text1, text2),
        pattern: detectCommonPatterns(text1, text2),
        keyword: analyzeKeywordOverlap(text1, text2),
        confidence: 0
    };
    
    // Calculate overall confidence based on all metrics
    analysis.confidence = (
        analysis.semantic * 0.4 +
        analysis.structural * 0.3 +
        analysis.pattern * 0.2 +
        analysis.keyword * 0.1
    );
    
    return analysis;
}

function calculateSemanticSimilarity(text1, text2) {
    // Normalize and tokenize
    const tokens1 = text1.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    const tokens2 = text2.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    
    // Calculate Jaccard similarity
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
}

function calculateStructuralSimilarity(text1, text2) {
    // Analyze sentence structure and formatting
    const lines1 = text1.split('\n').filter(line => line.trim().length > 0);
    const lines2 = text2.split('\n').filter(line => line.trim().length > 0);
    
    // Compare line count and average line length
    const avgLength1 = lines1.reduce((sum, line) => sum + line.length, 0) / lines1.length;
    const avgLength2 = lines2.reduce((sum, line) => sum + line.length, 0) / lines2.length;
    
    const lengthSimilarity = 1 - Math.abs(avgLength1 - avgLength2) / Math.max(avgLength1, avgLength2);
    const countSimilarity = 1 - Math.abs(lines1.length - lines2.length) / Math.max(lines1.length, lines2.length);
    
    return (lengthSimilarity + countSimilarity) / 2;
}

function detectCommonPatterns(text1, text2) {
    const patterns = [];
    
    // Detect common phrases (3+ words)
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    for (let i = 0; i <= words1.length - 3; i++) {
        for (let j = 0; j <= words2.length - 3; j++) {
            const phrase1 = words1.slice(i, i + 3).join(' ');
            const phrase2 = words2.slice(j, j + 3).join(' ');
            
            if (phrase1 === phrase2 && phrase1.length > 10) {
                patterns.push(phrase1);
            }
        }
    }
    
    // Calculate pattern density
    const totalWords = Math.min(words1.length, words2.length);
    return patterns.length / Math.max(totalWords / 10, 1);
}

function analyzeKeywordOverlap(text1, text2) {
    // Define AI-related keywords
    const aiKeywords = [
        'system', 'prompt', 'assistant', 'user', 'context', 'instruction',
        'behavior', 'response', 'format', 'output', 'input', 'model',
        'ai', 'artificial', 'intelligence', 'language', 'processing',
        'generate', 'analyze', 'provide', 'help', 'support', 'guide'
    ];
    
    const text1Lower = text1.toLowerCase();
    const text2Lower = text2.toLowerCase();
    
    let overlap = 0;
    aiKeywords.forEach(keyword => {
        if (text1Lower.includes(keyword) && text2Lower.includes(keyword)) {
            overlap++;
        }
    });
    
    return overlap / aiKeywords.length;
}

// Enhanced comparison function
function performAdvancedComparison() {
    const submission1Id = document.getElementById('submission1').value;
    const submission2Id = document.getElementById('submission2').value;
    
    if (!submission1Id || !submission2Id) {
        showAlert('Please select two submissions to compare.');
        return;
    }
    
    const submission1 = leakDatabase.find(s => s.id === submission1Id);
    const submission2 = leakDatabase.find(s => s.id === submission2Id);
    
    if (!submission1 || !submission2) {
        showAlert('Selected submissions not found.');
        return;
    }
    
    // Perform advanced analysis
    const advancedAnalysis = advancedSimilarityAnalysis(submission1.content, submission2.content);
    
    // Update comparison results
    const resultsDiv = document.getElementById('comparisonResults');
    resultsDiv.innerHTML = `
        <div class="comparison-header">
            <h3>🤖 Advanced AI Analysis Results</h3>
            <div class="confidence-meter">
                <div class="confidence-bar" style="width: ${advancedAnalysis.confidence * 100}%"></div>
                <span class="confidence-text">${Math.round(advancedAnalysis.confidence * 100)}% Match</span>
            </div>
        </div>
        
        <div class="analysis-grid">
            <div class="analysis-item">
                <h4>🧠 Semantic Similarity</h4>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${advancedAnalysis.semantic * 100}%"></div>
                    <span>${Math.round(advancedAnalysis.semantic * 100)}%</span>
                </div>
                <p>Meaning and context similarity</p>
            </div>
            
            <div class="analysis-item">
                <h4>🏗️ Structural Similarity</h4>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${advancedAnalysis.structural * 100}%"></div>
                    <span>${Math.round(advancedAnalysis.structural * 100)}%</span>
                </div>
                <p>Format and organization similarity</p>
            </div>
            
            <div class="analysis-item">
                <h4>🔍 Pattern Detection</h4>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${advancedAnalysis.pattern * 100}%"></div>
                    <span>${Math.round(advancedAnalysis.pattern * 100)}%</span>
                </div>
                <p>Common phrase and pattern density</p>
            </div>
            
            <div class="analysis-item">
                <h4>🎯 Keyword Overlap</h4>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${advancedAnalysis.keyword * 100}%"></div>
                    <span>${Math.round(advancedAnalysis.keyword * 100)}%</span>
                </div>
                <p>AI-related terminology overlap</p>
            </div>
        </div>
        
        <div class="verification-recommendation">
            <h4>🔍 Verification Recommendation</h4>
            <p>${advancedAnalysis.confidence > 0.8 ? '✅ HIGH CONFIDENCE - Strong evidence of similarity' : 
                  advancedAnalysis.confidence > 0.6 ? '⚠️ MODERATE CONFIDENCE - Some similarities detected' : 
                  '❌ LOW CONFIDENCE - Minimal similarity detected'}</p>
        </div>
    `;
    
    // Auto-boost confidence if high similarity
    if (advancedAnalysis.confidence > 0.7) {
        submission1.confidence = Math.min(100, submission1.confidence + 20);
        submission2.confidence = Math.min(100, submission2.confidence + 20);
        saveDatabase().then(() => {
            updateUI();
            showAlert('High similarity detected! Confidence scores automatically boosted! 🚀');
        });
    }
}

// Dynamic Achievement System
function checkAchievements(username) {
    if (!userStats[username]) return;
    
    const stats = userStats[username];
    const newAchievements = [];
    
    // Check each achievement
    Object.values(achievements).forEach(achievement => {
        if (userAchievements[username] && userAchievements[username].includes(achievement.id)) return;
        
        let unlocked = false;
        
        switch (achievement.id) {
            case 'firstBlood':
                unlocked = stats.submissions >= 1;
                break;
            case 'discoverer':
                unlocked = stats.firstDiscoveries >= 1;
                break;
            case 'verifier':
                unlocked = stats.verifiedLeaks >= 5;
                break;
            case 'collector':
                unlocked = stats.submissions >= 10;
                break;
            case 'expert':
                unlocked = stats.totalScore >= 1000;
                break;
            case 'pioneer':
                unlocked = stats.firstDiscoveries >= 5;
                break;
            case 'analyst':
                unlocked = (stats.comparisons || 0) >= 20;
                break;
            case 'challenger':
                unlocked = (stats.challengesCompleted || 0) >= 5;
                break;
            case 'community':
                unlocked = (stats.requestsSubmitted || 0) >= 10;
                break;
            case 'legend':
                unlocked = Object.keys(achievements).every(id => 
                    userAchievements[username] && userAchievements[username].includes(id)
                );
                break;
        }
        
        if (unlocked) {
            if (!userAchievements[username]) userAchievements[username] = [];
            userAchievements[username].push(achievement.id);
            newAchievements.push(achievement);
            
            // Award points
            stats.totalScore += achievement.points;
            
            // Show achievement notification
            showAchievementNotification(achievement);
        }
    });
    
    if (newAchievements.length > 0) {
        saveDatabase();
        updateUI();
    }
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h4>🏆 Achievement Unlocked!</h4>
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                <span class="points-earned">+${achievement.points} points</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 5000);
}

function displayAchievements(username) {
    if (!userAchievements[username]) return [];
    
    return userAchievements[username].map(id => achievements[id]).filter(Boolean);
}

// Enhanced user stats tracking
function updateUserStats(username, action, data = {}) {
    if (!userStats[username]) {
        userStats[username] = {
            submissions: 0,
            verifiedLeaks: 0,
            firstDiscoveries: 0,
            totalScore: 0,
            joinDate: new Date().toISOString(),
            toolsDiscovered: 0,
            appsDiscovered: 0,
            agentsDiscovered: 0,
            comparisons: 0,
            challengesCompleted: 0,
            requestsSubmitted: 0
        };
    }
    
    switch (action) {
        case 'submission':
            userStats[username].submissions++;
            break;
        case 'firstDiscovery':
            userStats[username].firstDiscoveries++;
            break;
        case 'verification':
            userStats[username].verifiedLeaks++;
            break;
        case 'comparison':
            userStats[username].comparisons++;
            break;
        case 'challengeComplete':
            userStats[username].challengesCompleted++;
            break;
        case 'requestSubmitted':
            userStats[username].requestsSubmitted++;
            break;
    }
    
    // Check for new achievements
    checkAchievements(username);
}

// Chat System Functions
let chatMessages = [];
let onlineUsers = new Set();

function toggleChat() {
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel.style.display === 'none') {
        chatPanel.style.display = 'block';
        if (!currentUser || currentUser === 'Guest') {
            currentUser = prompt('Enter your username for chat:') || 'Guest';
            localStorage.setItem('currentUser', currentUser);
            updateUserInterface();
        }
        if (currentUser && currentUser !== 'Guest') {
            onlineUsers.add(currentUser);
            updateOnlineUsers();
            addChatMessage('system', `${currentUser} joined the chat!`);
        }
    } else {
        chatPanel.style.display = 'none';
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message && currentUser) {
        addChatMessage('user', message, currentUser);
        input.value = '';
        
        // Simulate responses for demo
        setTimeout(() => {
            const responses = [
                'Interesting discovery! 🔍',
                'I\'ll help verify that! ✅',
                'Great find! 🚀',
                'Let me check the similarity...',
                'This looks promising! 💡'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage('bot', randomResponse, 'LeakHub Bot');
        }, 1000 + Math.random() * 2000);
    }
}

function addChatMessage(type, message, username = 'System') {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${username}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${message}</div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Keep only last 50 messages
    if (messagesDiv.children.length > 50) {
        messagesDiv.removeChild(messagesDiv.firstChild);
    }
}

function updateOnlineUsers() {
    const usersDiv = document.getElementById('chatUsers');
    const countSpan = document.getElementById('onlineCount');
    
    countSpan.textContent = onlineUsers.size;
    
    const usersList = Array.from(onlineUsers).map(user => 
        `<div class="online-user">🟢 ${user}</div>`
    ).join('');
    
    usersDiv.innerHTML = `
        <div class="online-indicator">🟢 Online: <span id="onlineCount">${onlineUsers.size}</span></div>
        <div class="users-list">${usersList}</div>
    `;
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
});

// Security utility functions
function sanitizeHTML(text) {
    if (typeof text !== 'string') return '';
    
    // Create a temporary div to escape HTML
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function safeInnerHTML(element, content) {
    if (!element) return;
    
    // For simple text content, use textContent instead
    if (typeof content === 'string' && !content.includes('<')) {
        element.textContent = content;
        return;
    }
    
    // For HTML content, sanitize user inputs
    if (typeof content === 'string') {
        // This is a simplified sanitizer - in production, use a library like DOMPurify
        const sanitized = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        element.innerHTML = sanitized;
    }
}

// Production-Ready Features
let userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

// Initialize production features
function initializeProductionFeatures() {
    updateUserInterface();
    setupNavigation();
    loadUserPreferences();
    updateActiveUsers();
    
    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);
    
    // Update stats every 10 seconds
    setInterval(updateRealTimeStats, 10000);
}

function updateUserInterface() {
    // Initialize currentUser if not set
    if (!currentUser || currentUser === 'Guest') {
        currentUser = localStorage.getItem('currentUser') || 'Guest';
    }
    
    const currentUserNameEl = document.getElementById('currentUserName');
    const profileNameEl = document.getElementById('profileName');
    const userNameInputEl = document.getElementById('userNameInput');
    const activeUsersEl = document.getElementById('activeUsers');
    
    if (currentUserNameEl) currentUserNameEl.textContent = currentUser;
    if (profileNameEl) profileNameEl.textContent = currentUser;
    if (userNameInputEl) userNameInputEl.value = currentUser;
    
    // Update active users count
    if (activeUsersEl) {
        const uniqueUsers = new Set(leakDatabase.map(sub => sub.source));
        activeUsersEl.textContent = uniqueUsers.size;
    }
}

function setupNavigation() {
    // Handle navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            scrollToSection(target);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

function scrollToSection(sectionId) {
    const sections = {
        'submit': document.querySelector('.submission-form'),
        'library': document.querySelector('.submissions-list'),
        'compare': document.querySelector('.comparison-section'),
        'community': document.querySelector('.leaderboard-overlay'),
        'analytics': document.querySelector('.analytics-overlay')
    };
    
    if (sections[sectionId]) {
        sections[sectionId].scrollIntoView({ behavior: 'smooth' });
    }
}

// User Profile Functions
function toggleUserProfile() {
    const overlay = document.getElementById('userProfileOverlay');
    if (overlay.style.display === 'none') {
        loadUserProfile();
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function loadUserProfile() {
    const stats = userStats[currentUser] || {};
    const userAchievements = displayAchievements(currentUser);
    
    // Update profile stats
    document.getElementById('profileStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.submissions || 0}</div>
            <div class="stat-label">Submissions</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.firstDiscoveries || 0}</div>
            <div class="stat-label">First Discoveries</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.verifiedLeaks || 0}</div>
            <div class="stat-label">Verified Leaks</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.totalScore || 0}</div>
            <div class="stat-label">Total Score</div>
        </div>
    `;
    
    // Update achievements
    document.getElementById('profileAchievements').innerHTML = userAchievements.length > 0 
        ? userAchievements.map(achievement => `
            <div class="achievement-badge">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            </div>
        `).join('')
        : '<p style="color: #666; text-align: center;">No achievements yet. Start submitting to earn badges!</p>';
}

// Settings Functions
function toggleSettings() {
    const overlay = document.getElementById('settingsOverlay');
    if (overlay.style.display === 'none') {
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function loadUserPreferences() {
    document.getElementById('userNameInput').value = currentUser;
    document.getElementById('notificationsEnabled').checked = userPreferences.notifications !== false;
    document.getElementById('autoSaveEnabled').checked = userPreferences.autoSave !== false;
}

function saveUserPreferences() {
    currentUser = document.getElementById('userNameInput').value || 'Guest';
    userPreferences.notifications = document.getElementById('notificationsEnabled').checked;
    userPreferences.autoSave = document.getElementById('autoSaveEnabled').checked;
    
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    
    updateUserInterface();
    showAlert('Settings saved successfully!');
}

// Analytics Functions
function toggleAnalytics() {
    const overlay = document.getElementById('analyticsOverlay');
    if (overlay.style.display === 'none') {
        loadAnalytics();
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function loadAnalytics() {
    loadPlatformStats();
    loadTargetDistribution();
    loadGrowthTrends();
    loadTopContributors();
}

function loadPlatformStats() {
    const totalSubmissions = leakDatabase.length;
    const verifiedCount = leakDatabase.filter(sub => sub.confidence >= 95).length;
    const uniqueUsers = new Set(leakDatabase.map(sub => sub.source)).size;
    const avgConfidence = leakDatabase.length > 0 
        ? Math.round(leakDatabase.reduce((sum, sub) => sum + sub.confidence, 0) / leakDatabase.length)
        : 0;
    
    document.getElementById('platformStats').innerHTML = `
        <div class="analytics-stat">
            <div class="stat-number">${totalSubmissions}</div>
            <div class="stat-label">Total Submissions</div>
        </div>
        <div class="analytics-stat">
            <div class="stat-number">${verifiedCount}</div>
            <div class="stat-label">Verified Prompts</div>
        </div>
        <div class="analytics-stat">
            <div class="stat-number">${uniqueUsers}</div>
            <div class="stat-label">Active Users</div>
        </div>
        <div class="analytics-stat">
            <div class="stat-number">${avgConfidence}%</div>
            <div class="stat-label">Avg Confidence</div>
        </div>
    `;
}

function loadTargetDistribution() {
    const distribution = {};
    leakDatabase.forEach(sub => {
        distribution[sub.targetType] = (distribution[sub.targetType] || 0) + 1;
    });
    
    const chartData = Object.entries(distribution).map(([type, count]) => `
        <div class="chart-bar">
            <div class="bar-label">${type}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${(count / leakDatabase.length) * 100}%"></div>
            </div>
            <div class="bar-value">${count}</div>
        </div>
    `).join('');
    
    document.getElementById('targetChart').innerHTML = chartData;
}

function loadGrowthTrends() {
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    const dailySubmissions = last7Days.map(date => 
        leakDatabase.filter(sub => sub.timestamp.startsWith(date)).length
    );
    
    const trendData = last7Days.map((date, i) => `
        <div class="trend-item">
            <div class="trend-date">${new Date(date).toLocaleDateString()}</div>
            <div class="trend-value">${dailySubmissions[i]}</div>
        </div>
    `).join('');
    
    document.getElementById('growthTrends').innerHTML = trendData;
}

function loadTopContributors() {
    const topUsers = Object.entries(userStats)
        .sort((a, b) => b[1].totalScore - a[1].totalScore)
        .slice(0, 5);
    
    const contributorsData = topUsers.map((user, index) => `
        <div class="contributor-item">
            <div class="contributor-rank">#${index + 1}</div>
            <div class="contributor-name">${user[0]}</div>
            <div class="contributor-score">${user[1].totalScore} pts</div>
        </div>
    `).join('');
    
    document.getElementById('topContributors').innerHTML = contributorsData;
}

// Data Management Functions
function exportData() {
    const data = {
        leakDatabase,
        userStats,
        leakRequests,
        userVotes,
        dailyChallenge,
        userAchievements,
        userPreferences,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leakhub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showAlert('Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (confirm('This will replace all current data. Are you sure?')) {
                        leakDatabase = data.leakDatabase || [];
                        userStats = data.userStats || {};
                        leakRequests = data.leakRequests || [];
                        userVotes = data.userVotes || {};
                        dailyChallenge = data.dailyChallenge || null;
                        userAchievements = data.userAchievements || {};
                        userPreferences = data.userPreferences || {};
                        
                        saveDatabase().then(() => {
                            updateUI();
                            showAlert('Data imported successfully!');
                        });
                    }
                } catch (error) {
                    showAlert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function clearAllData() {
    if (confirm('This will permanently delete all data. Are you absolutely sure?')) {
        leakDatabase = [];
        userStats = {};
        leakRequests = [];
        userVotes = {};
        dailyChallenge = null;
        userAchievements = {};
        
        localStorage.clear();
        updateUI();
        showAlert('All data cleared successfully!');
    }
}

// Utility Functions
function autoSave() {
    if (userPreferences.autoSave !== false) {
        saveDatabase();
        console.log('Auto-saved at', new Date().toLocaleTimeString());
    }
}

function updateRealTimeStats() {
    updateActiveUsers();
    updateUI();
}

function updateActiveUsers() {
    const uniqueUsers = new Set(leakDatabase.map(sub => sub.source));
    document.getElementById('activeUsers').textContent = uniqueUsers.size;
}

// Enhanced notification system
function showNotification(title, message, type = 'info') {
    if (userPreferences.notifications !== false) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <h4>${title}</h4>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <p>${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Production features are now initialized in initializeApp()

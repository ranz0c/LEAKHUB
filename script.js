// LeakHub Database and State Management
let leakDatabase = [];
let selectedSubmissions = new Set();
let userStats = {};
let leakRequests = [];
let userVotes = {};
let dailyChallenge = null;

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
        
        // Initialize UI
        updateUI();
        initializeDailyChallenge();
        startChallengeTimer();
        
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
            agentsDiscovered: 0
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
    
    await saveDatabase();
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
        
        await saveDatabase();
        updateUI();
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
    const achievements = [];
    
    // First Discovery achievements
    const firstDiscoverers = {};
    leakDatabase.forEach(sub => {
        if (sub.isFirstDiscovery) {
            if (!firstDiscoverers[sub.instance]) {
                firstDiscoverers[sub.instance] = sub.source;
            }
        }
    });
    
    Object.entries(firstDiscoverers).forEach(([instance, user]) => {
        achievements.push({
            icon: '🎯',
            title: `First ${instance} Leak`,
            user: user,
            description: `First to discover ${instance} system prompt`
        });
    });
    
    // Most Verified Leaks
    const topVerifier = Object.entries(userStats)
        .sort((a, b) => b[1].verifiedLeaks - a[1].verifiedLeaks)[0];
    
    if (topVerifier && topVerifier[1].verifiedLeaks > 0) {
        achievements.push({
            icon: '🔍',
            title: 'Master Verifier',
            user: topVerifier[0],
            description: `${topVerifier[1].verifiedLeaks} verified leaks`
        });
    }
    
    // Most Submissions
    const topSubmitter = Object.entries(userStats)
        .sort((a, b) => b[1].submissions - a[1].submissions)[0];
    
    if (topSubmitter && topSubmitter[1].submissions > 5) {
        achievements.push({
            icon: '📊',
            title: 'Prolific Hunter',
            user: topSubmitter[0],
            description: `${topSubmitter[1].submissions} total submissions`
        });
    }
    
    // Highest Score
    const topScorer = Object.entries(userStats)
        .sort((a, b) => b[1].totalScore - a[1].totalScore)[0];
    
    if (topScorer) {
        achievements.push({
            icon: '🏆',
            title: 'Top Contributor',
            user: topScorer[0],
            description: `${topScorer[1].totalScore} total points`
        });
    }
    
    if (achievements.length === 0) {
        achievementsList.innerHTML = '<p style="color: #666; text-align: center;">No achievements yet!</p>';
        return;
    }
    
    achievementsList.innerHTML = achievements.map(achievement => `
        <div class="achievement-card">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-user">${achievement.user}</div>
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
    await saveDatabase();
    updateRequestsList();
    
    // Clear form
    document.getElementById('requestModel').value = '';
    document.getElementById('requestDescription').value = '';
    document.getElementById('requestBounty').value = '';
    
    showAlert('Request submitted successfully!');
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
        
        await saveDatabase();
        showAlert(`🎯 Daily Challenge Completed! +${dailyChallenge.reward} points!`);
    }
}

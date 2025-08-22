// Database abstraction layer for LeakHub
// Supports both localStorage and future backend APIs

class LeakHubDatabase {
    constructor() {
        this.storagePrefix = 'leakhub_';
        this.apiEndpoint = null; // Will be set for backend mode
        this.isBackendMode = false;
    }

    // Initialize database with optional backend endpoint
    async init(backendUrl = null) {
        if (backendUrl) {
            this.apiEndpoint = backendUrl;
            this.isBackendMode = true;
            console.log('LeakHub: Backend mode enabled');
        } else {
            console.log('LeakHub: Local storage mode enabled');
        }
    }

    // Generic storage methods
    async get(key) {
        if (this.isBackendMode) {
            return await this._getFromBackend(key);
        } else {
            return this._getFromLocalStorage(key);
        }
    }

    async set(key, value) {
        if (this.isBackendMode) {
            return await this._setToBackend(key, value);
        } else {
            return this._setToLocalStorage(key, value);
        }
    }

    async delete(key) {
        if (this.isBackendMode) {
            return await this._deleteFromBackend(key);
        } else {
            return this._deleteFromLocalStorage(key);
        }
    }

    // LocalStorage methods
    _getFromLocalStorage(key) {
        try {
            const fullKey = this.storagePrefix + key;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    _setToLocalStorage(key, value) {
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    _deleteFromLocalStorage(key) {
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Error deleting from localStorage:', error);
            return false;
        }
    }

    // Backend API methods
    async _getFromBackend(key) {
        try {
            const response = await fetch(`${this.apiEndpoint}/data/${key}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                console.error('Backend GET error:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error fetching from backend:', error);
            return null;
        }
    }

    async _setToBackend(key, value) {
        try {
            const response = await fetch(`${this.apiEndpoint}/data/${key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(value)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error saving to backend:', error);
            return false;
        }
    }

    async _deleteFromBackend(key) {
        try {
            const response = await fetch(`${this.apiEndpoint}/data/${key}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error deleting from backend:', error);
            return false;
        }
    }

    // Specific LeakHub data methods
    async getLeakDatabase() {
        return await this.get('leakDatabase') || [];
    }

    async setLeakDatabase(data) {
        return await this.set('leakDatabase', data);
    }

    async getUserStats() {
        return await this.get('userStats') || {};
    }

    async setUserStats(data) {
        return await this.set('userStats', data);
    }

    async getLeakRequests() {
        return await this.get('leakRequests') || [];
    }

    async setLeakRequests(data) {
        return await this.set('leakRequests', data);
    }

    async getUserVotes() {
        return await this.get('userVotes') || {};
    }

    async setUserVotes(data) {
        return await this.set('userVotes', data);
    }

    async getDailyChallenge() {
        return await this.get('dailyChallenge') || null;
    }

    async setDailyChallenge(data) {
        return await this.set('dailyChallenge', data);
    }

    async getAverageSimilarity() {
        return await this.get('avgSimilarity') || '0';
    }

    async setAverageSimilarity(value) {
        return await this.set('avgSimilarity', value);
    }

    // Export/Import functionality
    async exportData() {
        const data = {
            leakDatabase: await this.getLeakDatabase(),
            userStats: await this.getUserStats(),
            leakRequests: await this.getLeakRequests(),
            userVotes: await this.getUserVotes(),
            dailyChallenge: await this.getDailyChallenge(),
            avgSimilarity: await this.getAverageSimilarity(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return data;
    }

    async importData(data) {
        try {
            if (data.leakDatabase) await this.setLeakDatabase(data.leakDatabase);
            if (data.userStats) await this.setUserStats(data.userStats);
            if (data.leakRequests) await this.setLeakRequests(data.leakRequests);
            if (data.userVotes) await this.setUserVotes(data.userVotes);
            if (data.dailyChallenge) await this.setDailyChallenge(data.dailyChallenge);
            if (data.avgSimilarity) await this.setAverageSimilarity(data.avgSimilarity);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Backup and restore
    async createBackup() {
        const data = await this.exportData();
        const backupKey = `backup_${Date.now()}`;
        await this.set(backupKey, data);
        return backupKey;
    }

    async restoreBackup(backupKey) {
        const backup = await this.get(backupKey);
        if (backup) {
            return await this.importData(backup);
        }
        return false;
    }

    // Analytics and statistics
    async getStatistics() {
        const leakDatabase = await this.getLeakDatabase();
        const userStats = await this.getUserStats();
        
        return {
            totalSubmissions: leakDatabase.length,
            uniqueUsers: Object.keys(userStats).length,
            totalScore: Object.values(userStats).reduce((sum, stats) => sum + (stats.totalScore || 0), 0),
            verifiedLeaks: leakDatabase.filter(sub => sub.confidence >= 90).length,
            firstDiscoveries: leakDatabase.filter(sub => sub.isFirstDiscovery).length,
            targetTypes: this._countTargetTypes(leakDatabase),
            recentActivity: this._getRecentActivity(leakDatabase)
        };
    }

    _countTargetTypes(leakDatabase) {
        const counts = {};
        leakDatabase.forEach(sub => {
            const type = sub.targetType || 'model';
            counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
    }

    _getRecentActivity(leakDatabase) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return leakDatabase.filter(sub => 
            new Date(sub.timestamp) > oneWeekAgo
        ).length;
    }
}

// Create global instance
window.LeakHubDB = new LeakHubDatabase();

// Auto-initialize
window.LeakHubDB.init().then(() => {
    console.log('LeakHub Database initialized');
});

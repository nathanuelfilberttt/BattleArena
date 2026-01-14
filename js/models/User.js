/**
 * User Model
 */
class User {
    constructor(data) {
        this.id = data.id || null;
        this.username = data.username || '';
        this.password = data.password || '';
        this.email = data.email || '';
        this.role = data.role || 'member'; // 'guest', 'member', 'moderator'
        this.title = data.title || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.stats = data.stats || {
            totalUploads: 0,
            totalWins: 0,
            totalLikes: 0
        };
        this.achievements = data.achievements || [];
    }

    toJSON() {
        const { password, ...userData } = this;
        return userData;
    }

    hasAchievement(achievementId) {
        return this.achievements.some(a => a.id === achievementId);
    }

    unlockAchievement(achievement) {
        if (!this.hasAchievement(achievement.id)) {
            this.achievements.push({
                id: achievement.id,
                name: achievement.name,
                unlockedAt: new Date().toISOString()
            });
        }
    }
}


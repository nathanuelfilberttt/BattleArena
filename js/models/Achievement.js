// File: js/models/Achievement.js

/**
 * Achievement Model
 */
class Achievement {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.icon = data.icon || '🏆';
        this.requirement = data.requirement || { type: '', count: 0 };
        this.color = data.color || '#6366f1';
        this.textColor = data.textColor || '#ffffff';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            icon: this.icon,
            requirement: this.requirement,
            color: this.color,
            textColor: this.textColor,
            createdAt: this.createdAt
        };
    }

    /**
     * Mengecek apakah persyaratan achievement sudah terpenuhi
     * @param {Object} userStats - Berisi totalUploads, totalLikes, dll.
     */
    checkRequirement(user, userStats) {
        switch (this.requirement.type) {
            case 'upload':
                return userStats.totalUploads >= this.requirement.count;
            case 'total_votes':
                return userStats.totalLikes >= this.requirement.count;
            case 'none':
                // Untuk "No Title", selalu true
                return true; 
            default:
                return false;
        }
    }
}
/**
 * Vote Model
 */
class Vote {
    constructor(data) {
        this.id = data.id || null;
        this.memeId = data.memeId || null;
        this.userId = data.userId || null;
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            memeId: this.memeId,
            userId: this.userId,
            createdAt: this.createdAt
        };
    }
}


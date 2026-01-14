/**
 * Comment Model
 */
class Comment {
    constructor(data) {
        this.id = data.id || null;
        this.memeId = data.memeId || null;
        this.userId = data.userId || null;
        this.username = data.username || '';
        this.text = data.text || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            memeId: this.memeId,
            userId: this.userId,
            username: this.username,
            text: this.text,
            createdAt: this.createdAt
        };
    }
}


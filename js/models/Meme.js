/**
 * Meme Model
 */
class Meme {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.username = data.username || '';
        this.title = data.title || '';
        this.category = data.category || '';
        this.description = data.description || '';
        this.imageUrl = data.imageUrl || '';
        this.voteCount = data.voteCount || 0;
        this.commentCount = data.commentCount || 0;
        // Convert old commentsEnabled to statusComments for backward compatibility
        if (data.statusComments) {
            this.statusComments = data.statusComments;
        } else if (data.commentsEnabled !== undefined) {
            this.statusComments = data.commentsEnabled ? 'enabled' : 'disabled';
        } else {
            this.statusComments = 'enabled';
        }
        this.createdAt = data.createdAt || new Date().toISOString();
        this.arenaId = data.arenaId || null;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            username: this.username,
            title: this.title,
            category: this.category,
            description: this.description,
            imageUrl: this.imageUrl,
            voteCount: this.voteCount,
            commentCount: this.commentCount,
            statusComments: this.statusComments,
            createdAt: this.createdAt,
            arenaId: this.arenaId
        };
    }
}


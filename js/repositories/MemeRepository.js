/**
 * Meme Repository - Repository Pattern Implementation
 */
class MemeRepository {
    constructor() {
        this.collection = 'memes';
    }

    findAll() {
        const data = database.getAll(this.collection);
        return data.map(item => new Meme(item));
    }

    findById(id) {
        const data = database.getById(this.collection, id);
        return data ? new Meme(data) : null;
    }

    findByUserId(userId) {
        const data = database.find(this.collection, meme => meme.userId === userId);
        return data.map(item => new Meme(item));
    }

    findByCategory(category) {
        const data = database.find(this.collection, meme => meme.category === category);
        return data.map(item => new Meme(item));
    }

    findByArena(arenaId) {
        const data = database.find(this.collection, meme => meme.arenaId === arenaId);
        return data.map(item => new Meme(item));
    }

    findTrending(limit = 10, filter = {}) {
        let memes = this.findAll();
        
        // Apply filters
        if (filter.category) {
            memes = memes.filter(m => m.category === filter.category);
        }
        if (filter.timeRange) {
            const now = new Date();
            const timeRanges = {
                'today': 1,
                'week': 7,
                'month': 30,
                'all': Infinity
            };
            const days = timeRanges[filter.timeRange] || Infinity;
            const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            memes = memes.filter(m => new Date(m.createdAt) >= cutoffDate);
        }

        // Sort by vote count
        memes.sort((a, b) => b.voteCount - a.voteCount);
        
        return memes.slice(0, limit);
    }

    create(memeData) {
        const meme = new Meme(memeData);
        const saved = database.create(this.collection, meme);
        return new Meme(saved);
    }

    update(id, updates) {
        const updated = database.update(this.collection, id, updates);
        return updated ? new Meme(updated) : null;
    }

    delete(id) {
        return database.delete(this.collection, id);
    }

    count() {
        return database.count(this.collection);
    }

    incrementVoteCount(id) {
        const meme = this.findById(id);
        if (meme) {
            meme.voteCount++;
            return this.update(id, { voteCount: meme.voteCount });
        }
        return null;
    }

    decrementVoteCount(id) {
        const meme = this.findById(id);
        if (meme) {
            meme.voteCount = Math.max(0, meme.voteCount - 1);
            return this.update(id, { voteCount: meme.voteCount });
        }
        return null;
    }

    incrementCommentCount(id) {
        const meme = this.findById(id);
        if (meme) {
            meme.commentCount++;
            return this.update(id, { commentCount: meme.commentCount });
        }
        return null;
    }
}


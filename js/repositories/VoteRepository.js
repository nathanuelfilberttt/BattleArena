/**
 * Vote Repository - Repository Pattern Implementation
 */
class VoteRepository {
    constructor() {
        this.collection = 'votes';
    }

    findAll() {
        const data = database.getAll(this.collection);
        return data.map(item => new Vote(item));
    }

    findById(id) {
        const data = database.getById(this.collection, id);
        return data ? new Vote(data) : null;
    }

    findByMemeId(memeId) {
        const data = database.find(this.collection, vote => vote.memeId === memeId);
        return data.map(item => new Vote(item));
    }

    findByUserId(userId) {
        const data = database.find(this.collection, vote => vote.userId === userId);
        return data.map(item => new Vote(item));
    }

    findByMemeAndUser(memeId, userId) {
        const data = database.findOne(this.collection, 
            vote => vote.memeId === memeId && vote.userId === userId
        );
        return data ? new Vote(data) : null;
    }

    create(voteData) {
        const vote = new Vote(voteData);
        const saved = database.create(this.collection, vote);
        return new Vote(saved);
    }

    delete(id) {
        return database.delete(this.collection, id);
    }

    deleteByMemeAndUser(memeId, userId) {
        const vote = this.findByMemeAndUser(memeId, userId);
        if (vote) {
            return this.delete(vote.id);
        }
        return false;
    }

    count() {
        return database.count(this.collection);
    }

    countByMemeId(memeId) {
        return database.count(this.collection, vote => vote.memeId === memeId);
    }
}


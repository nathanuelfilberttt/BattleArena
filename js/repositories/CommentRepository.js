/**
 * Comment Repository - Repository Pattern Implementation
 */
class CommentRepository {
    constructor() {
        this.collection = 'comments';
    }

    findAll() {
        const data = database.getAll(this.collection);
        return data.map(item => new Comment(item));
    }

    findById(id) {
        const data = database.getById(this.collection, id);
        return data ? new Comment(data) : null;
    }

    findByMemeId(memeId) {
        const data = database.find(this.collection, comment => comment.memeId === memeId);
        return data.map(item => new Comment(item)).sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
    }

    findByUserId(userId) {
        const data = database.find(this.collection, comment => comment.userId === userId);
        return data.map(item => new Comment(item));
    }

    create(commentData) {
        const comment = new Comment(commentData);
        const saved = database.create(this.collection, comment);
        return new Comment(saved);
    }

    update(id, updates) {
        const updated = database.update(this.collection, id, updates);
        return updated ? new Comment(updated) : null;
    }

    delete(id) {
        return database.delete(this.collection, id);
    }

    count() {
        return database.count(this.collection);
    }
}


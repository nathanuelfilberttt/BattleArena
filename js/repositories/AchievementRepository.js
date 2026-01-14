/**
 * Achievement Repository - Repository Pattern Implementation
 */
class AchievementRepository {
    constructor() {
        this.collection = 'achievements';
    }

    findAll() {
        const data = database.getAll(this.collection);
        return data.map(item => new Achievement(item));
    }

    findById(id) {
        const data = database.getById(this.collection, id);
        return data ? new Achievement(data) : null;
    }

    create(achievementData) {
        const achievement = new Achievement(achievementData);
        const saved = database.create(this.collection, achievement);
        return new Achievement(saved);
    }

    update(id, updates) {
        const updated = database.update(this.collection, id, updates);
        return updated ? new Achievement(updated) : null;
    }

    delete(id) {
        return database.delete(this.collection, id);
    }

    count() {
        return database.count(this.collection);
    }
}


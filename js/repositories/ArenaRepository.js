/**
 * Arena Repository - Repository Pattern Implementation
 */
class ArenaRepository {
    constructor() {
        this.collection = 'arenas';
    }

    findAll() {
        const data = database.getAll(this.collection);
        return data.map(item => new Arena(item));
    }

    findById(id) {
        const data = database.getById(this.collection, id);
        return data ? new Arena(data) : null;
    }

    findActive() {
        const data = database.find(this.collection, arena => arena.isActive === true);
        return data.map(item => new Arena(item));
    }

    create(arenaData) {
        const arena = new Arena(arenaData);
        const saved = database.create(this.collection, arena);
        return new Arena(saved);
    }

    update(id, updates) {
        const updated = database.update(this.collection, id, updates);
        return updated ? new Arena(updated) : null;
    }

    delete(id) {
        return database.delete(this.collection, id);
    }

    count() {
        return database.count(this.collection);
    }
}


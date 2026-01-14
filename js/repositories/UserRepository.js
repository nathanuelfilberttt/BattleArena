/**
 * User Repository - Repository Pattern Implementation
 */
class UserRepository {
    constructor() {
        this.collection = 'users';
    }

    findAll() {
        const data = database.getAll(this.collection);
        return data.map(item => new User(item));
    }

    findById(id) {
        const data = database.getById(this.collection, id);
        return data ? new User(data) : null;
    }

    findByUsername(username) {
        const data = database.findOne(this.collection, user => user.username === username);
        return data ? new User(data) : null;
    }

    findByEmail(email) {
        const data = database.findOne(this.collection, user => user.email === email);
        return data ? new User(data) : null;
    }

    create(userData) {
        const user = new User(userData);
        const saved = database.create(this.collection, user);
        return new User(saved);
    }

    update(id, updates) {
        const updated = database.update(this.collection, id, updates);
        return updated ? new User(updated) : null;
    }

    delete(id) {
        return database.delete(this.collection, id);
    }

    count() {
        return database.count(this.collection);
    }

    findByRole(role) {
        const data = database.find(this.collection, user => user.role === role);
        return data.map(item => new User(item));
    }
}


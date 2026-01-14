/**
 * Authentication Service
 */
class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
        this.currentUser = null;
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = new User(JSON.parse(userData));
        }
    }

    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user.toJSON()));
            this.currentUser = user;
        } else {
            localStorage.removeItem('currentUser');
            this.currentUser = null;
        }
    }

    login(username, password) {
        const user = this.userRepository.findByUsername(username);
        
        if (!user) {
            throw new Error('Username is not found');
        }

        if (user.password !== password) {
            throw new Error('Wrong username or password');
        }

        this.saveCurrentUser(user);
        return user;
    }

    register(username, email, password) {
        // Validation
        if (!username || !email || !password) {
            throw new Error('All fields are required');
        }

        if (this.userRepository.findByUsername(username)) {
            throw new Error('Username is already taken');
        }

        if (this.userRepository.findByEmail(email)) {
            throw new Error('Email is already registered');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const userData = {
            username,
            email,
            password,
            role: 'member',
            stats: {
                totalUploads: 0,
                totalWins: 0,
                totalLikes: 0
            }
        };

        const user = this.userRepository.create(userData);
        this.saveCurrentUser(user);
        return user;
    }

    logout() {
        this.saveCurrentUser(null);
        //window.location.href = 'index.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isModerator() {
        return this.currentUser && this.currentUser.role === 'moderator';
    }

    updateProfile(userId, updates) {
        const updated = this.userRepository.update(userId, updates);
        if (updated && this.currentUser && this.currentUser.id === userId) {
            this.saveCurrentUser(updated);
        }
        return updated;
    }
}

// Global instance
const authService = new AuthService();

// Register SecurityAspect after authService is loaded
if (typeof aop !== 'undefined' && typeof SecurityAspect !== 'undefined') {
    aop.register(new SecurityAspect());
}


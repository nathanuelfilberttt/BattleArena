/**
 * Validation Service - Client and Server Side Validation
 */
class ValidationService {
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateUsername(username) {
        if (!username || username.length < 3) {
            return { isValid: false, error: 'Username must be at least 3 characters long' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
        }
        return { isValid: true };
    }

    validatePassword(password) {
        if (!password || password.length < 6) {
            return { isValid: false, error: 'Password must be at least 6 characters long' };
        }
        return { isValid: true };
    }

    validateMeme(data) {
        const errors = [];

        if (!data.title || data.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        }

        if (!data.category) {
            errors.push('A Category must be selected');
        }

        if (!data.description || data.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }

        if (!data.imageUrl) {
            errors.push('Image must be uploaded');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateComment(text) {
        if (!text || text.trim().length < 1) {
            return { isValid: false, error: 'Comment cannot be empty' };
        }
        if (text.trim().length > 500) {
            return { isValid: false, error: 'Comment maximum length is 500 characters' };
        }
        return { isValid: true };
    }

    validateArena(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 3) {
            errors.push('Arena name must be 3 characters or more');
        }

        if (!data.description || data.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateAchievement(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 3) {
            errors.push('Achievement name must be at least 3 characters long');
        }

        if (!data.description || data.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }

        if (!data.requirement || !data.requirement.type) {
            errors.push('Requirement type must be selected');
        }

        if (!data.requirement || !data.requirement.count || data.requirement.count < 1) {
            errors.push('Requirement count must be at least 1');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
}

const validationService = new ValidationService();
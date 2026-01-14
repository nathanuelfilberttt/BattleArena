/**
 * Arena Model
 */
class Arena {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.startDate = data.startDate || new Date().toISOString();
        this.endDate = data.endDate || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdBy = data.createdBy || null;
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            isActive: this.isActive,
            createdBy: this.createdBy,
            createdAt: this.createdAt
        };
    }
}


/**
 * File Uploader Utility
 */
class FileUploader {
    static async compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.onerror = () => reject(new Error('Error loading image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    static async uploadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                reject(new Error('File must be images (JPEG, PNG, GIF, or WebP)'));
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                reject(new Error('File size max is 5MB'));
                return;
            }

            // Compress image before converting to base64
            this.compressImage(file, 1920, 1080, 0.7)
                .then(resolve)
                .catch((error) => {
                    // If compression fails, fallback to original method
                    console.warn('Image compression failed, using original:', error);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve(e.target.result);
                    };
                    reader.onerror = () => {
                        reject(new Error('Error to read file'));
                    };
                    reader.readAsDataURL(file);
                });
        });
    }

    static validateImage(file) {
        const errors = [];

        if (!file) {
            errors.push('File must be chosen!');
            return { isValid: false, errors };
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            errors.push('File must be images (JPEG, PNG, GIF, or WebP)');
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            errors.push('File size max is 5MB');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}


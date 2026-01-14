/**
 * Aspect-Oriented Programming (AOP) Implementation
 * Handles cross-cutting concerns: logging, validation, error handling
 */
class AOP {
    constructor() {
        this.aspects = [];
    }

    /**
     * Register an aspect (advice)
     */
    register(aspect) {
        this.aspects.push(aspect);
    }

    /**
     * Apply aspects to a method
     */
    apply(target, methodName, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args) {
            // Before advice
            const beforeResults = this.aspects
                .filter(aspect => aspect.pointcut && aspect.pointcut(target, methodName))
                .map(aspect => {
                    if (aspect.before) {
                        return aspect.before(target, methodName, args);
                    }
                });

            let result;
            let error;

            try {
                // Execute original method
                result = originalMethod.apply(this, args);

                // After returning advice
                this.aspects
                    .filter(aspect => aspect.pointcut && aspect.pointcut(target, methodName))
                    .forEach(aspect => {
                        if (aspect.afterReturning) {
                            aspect.afterReturning(target, methodName, args, result);
                        }
                    });

                return result;
            } catch (e) {
                error = e;
                // After throwing advice
                this.aspects
                    .filter(aspect => aspect.pointcut && aspect.pointcut(target, methodName))
                    .forEach(aspect => {
                        if (aspect.afterThrowing) {
                            aspect.afterThrowing(target, methodName, args, error);
                        }
                    });
                throw error;
            } finally {
                // After advice (always executed)
                this.aspects
                    .filter(aspect => aspect.pointcut && aspect.pointcut(target, methodName))
                    .forEach(aspect => {
                        if (aspect.after) {
                            aspect.after(target, methodName, args, result, error);
                        }
                    });
            }
        }.bind(this);

        return descriptor;
    }
}

/**
 * Logging Aspect
 */
class LoggingAspect {
    pointcut(target, methodName) {
        // Apply to all methods in services and repositories
        return target.constructor.name.includes('Service') || 
               target.constructor.name.includes('Repository');
    }

    before(target, methodName, args) {
        console.log(`[LOG] ${target.constructor.name}.${methodName} called with:`, args);
    }

    afterReturning(target, methodName, args, result) {
        console.log(`[LOG] ${target.constructor.name}.${methodName} returned:`, result);
    }

    afterThrowing(target, methodName, args, error) {
        console.error(`[ERROR] ${target.constructor.name}.${methodName} threw:`, error);
    }
}

/**
 * Validation Aspect
 */
class ValidationAspect {
    pointcut(target, methodName) {
        // Apply to methods that create or update data
        return methodName.includes('create') || 
               methodName.includes('update') || 
               methodName.includes('save');
    }

    before(target, methodName, args) {
        if (target.validate && typeof target.validate === 'function') {
            const validationResult = target.validate(args[0]);
            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }
        }
    }
}

/**
 * Security Aspect (Authorization)
 */
class SecurityAspect {
    pointcut(target, methodName) {
        // Apply to methods that require authentication
        return methodName.includes('create') || 
               methodName.includes('update') || 
               methodName.includes('delete') ||
               methodName.includes('admin');
    }

    before(target, methodName, args) {
        // Check if authService is available
        if (typeof authService === 'undefined') {
            return; // Skip if authService not loaded yet
        }
        
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('Authentication required');
        }

        // Check for admin-only methods
        if (methodName.includes('admin') || methodName.includes('moderate')) {
            if (currentUser.role !== 'moderator') {
                throw new Error('Moderator access required');
            }
        }
    }
}

// Global AOP instance
const aop = new AOP();

// Register default aspects (SecurityAspect will be registered after authService is loaded)
aop.register(new LoggingAspect());
aop.register(new ValidationAspect());


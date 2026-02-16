/**
 * Format date with time support
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * Debounce function
 */
const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Throttle function
 */
const throttle = (func, limit = 300) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Get date difference in days
 */
const getDateDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Capitalize first letter
 */
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text
 */
const truncate = (str, maxLength = 50) => {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

/**
 * Group array by key
 */
const groupBy = (array, key) => {
    return array.reduce((acc, item) => {
        const group = item[key];
        acc[group] = acc[group] || [];
        acc[group].push(item);
        return acc;
    }, {});
};

/**
 * Remove duplicates from array
 */
const unique = (array) => {
    return [...new Set(array)];
};

/**
 * Sort array of objects
 */
const sortBy = (array, key, order = 'asc') => {
    return array.sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
    });
};

/**
 * Chunk array
 */
const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Check if empty (null, undefined, '', [], {})
 */
const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * Retry async function
 */
const retry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await sleep(delay);
        }
    }
};

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get random element from array
 */
const randomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Flatten nested array
 */
const flatten = (array) => {
    return array.reduce((acc, val) =>
        Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
};

/**
 * Convert to camelCase
 */
const toCamelCase = (str) => {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
};

/**
 * Convert to snake_case
 */
function toSnakeCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2') 
        .replace(/[-\s]+/g, '_')               
        .replace(/__+/g, '_')                   
        .toLowerCase()
        .replace(/^_+|_+$/g, '');               
}


/**
 * Parse query string
 */
const parseQueryString = (url) => {
    const params = {};
    const queryString = url.split('?')[1];
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    }
    return params;
};

/**
 * Generate slug from string
 */
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/**
 * Mask sensitive data (show last 4 chars)
 */
const maskString = (str, visibleChars = 4) => {
    if (str.length <= visibleChars) return str;
    return '*'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
};

/**
 * Sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 *  uniqueBy
 */
const  uniqueBy=(arr, key)=> {
    const seen = new Set();
    return arr.filter(item => {
        if (seen.has(item[key])) {
            return false;
        }
        seen.add(item[key]);
        return true;
    });
}

module.exports = {
    groupBy,
    sleep,
    debounce,
    throttle,
    uniqueBy,
    truncate,
    capitalize,
    formatDate,
    getDateDifference,
    unique,
    sortBy,
    chunk,
    isEmpty,
    retry,
    formatFileSize,
    randomElement,
    flatten,
    toCamelCase,
    toSnakeCase,
    parseQueryString,
    slugify,
    calculateAge,
    maskString
};
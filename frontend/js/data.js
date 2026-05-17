/**
 * Backend Data Management & Session Handling
 * Interfaces with the Node.js / Express backend API.
 */

const API_URL = 'http://localhost:5000/api';
const SESSION_KEY = 'smart_expense_tracker_session';
const USER_DATA_KEY = 'smart_expense_tracker_user';

// Helper to get headers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem(SESSION_KEY) || ''
    };
}

// --- Session & Auth Management ---

async function loginUser(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
    }
    
    const user = await res.json();
    localStorage.setItem(SESSION_KEY, user._id);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    return user;
}

async function registerUser(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
    }
    
    const user = await res.json();
    localStorage.setItem(SESSION_KEY, user._id);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    return user;
}

// Synchronously get cached user for UI checks (name, settings)
function getCurrentUser() {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_DATA_KEY);
}

async function updateSettings(settings) {
    const res = await fetch(`${API_URL}/auth/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
    });
    if (res.ok) {
        const user = await res.json();
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        return user;
    }
    throw new Error('Failed to update settings');
}

function formatMoney(amount) {
    const user = getCurrentUser();
    const currency = user && user.settings ? user.settings.currency : '$';
    return currency + parseFloat(amount).toFixed(2);
}

// --- Transactions & Analytics ---

async function getTransactions() {
    try {
        const res = await fetch(`${API_URL}/transactions`, { headers: getAuthHeaders() });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function addTransaction(transaction) {
    const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Failed to add transaction');
    return await res.json();
}

async function deleteTransaction(id) {
    // Pass ID in the route parameters
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
}

async function updateTransaction(id, updatedData) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('Failed to update transaction');
}

async function getSummaryStats() {
    try {
        const res = await fetch(`${API_URL}/analytics`, { headers: getAuthHeaders() });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

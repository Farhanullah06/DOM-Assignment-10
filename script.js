/**
 * TaskFlow - Modern Todo App
 * Complete CRUD operations with Local Storage persistence
 */

// ===== DOM Elements =====
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const clearAllBtn = document.getElementById('clearAllBtn');
const emptyState = document.getElementById('emptyState');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const modalClose = document.querySelector('.modal-close');
const modalBackdrop = document.querySelector('.modal-backdrop');

// Stats Elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// ===== State =====
let tasks = [];
let editingTaskId = null;

// ===== Local Storage Keys =====
const STORAGE_KEY = 'taskflow_tasks';

// ===== Initialize App =====
function init() {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    setupEventListeners();
}

// ===== Local Storage Functions =====
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (error) {
            console.error('Error parsing tasks from localStorage:', error);
            tasks = [];
        }
    }
}

function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ===== Task CRUD Operations =====

// Create: Add new task
function addTask(text) {
    if (!text || text.trim() === '') {
        shakeInput();
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasksToStorage();
    renderTasks();
    updateStats();
    taskInput.value = '';
    taskInput.focus();
}

// Read: Render all tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        clearAllBtn.disabled = true;
        return;
    }
    
    emptyState.classList.add('hidden');
    clearAllBtn.disabled = false;
    
    tasks.forEach(function(task) {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Create task DOM element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;
    
    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = 'task-checkbox';
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', task.completed);
    checkbox.setAttribute('tabindex', '0');
    checkbox.setAttribute('aria-label', 'Mark as ' + (task.completed ? 'incomplete' : 'complete'));
    checkbox.innerHTML = `
        <svg viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    
    // Actions container
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 2.5L13.5 4.5M2 14L2.5 11.5L10.5 3.5L12.5 5.5L4.5 13.5L2 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L4.5 13C4.5 13.5523 5 14 5.5 14H10.5C11.0523 14 11.5 13.5523 11.5 13L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Append elements
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actions);
    
    return li;
}

// Update: Toggle task completion
function toggleTask(id) {
    const taskIndex = tasks.findIndex(function(task) {
        return task.id === id;
    });
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// Update: Edit task
function openEditModal(id) {
    const task = tasks.find(function(t) {
        return t.id === id;
    });
    
    if (task) {
        editingTaskId = id;
        editInput.value = task.text;
        editModal.classList.add('active');
        editInput.focus();
        editInput.select();
    }
}

function saveTaskEdit() {
    const newText = editInput.value.trim();
    
    if (newText === '') {
        shakeEditInput();
        return;
    }
    
    const taskIndex = tasks.findIndex(function(task) {
        return task.id === editingTaskId;
    });
    
    if (taskIndex !== -1) {
        tasks[taskIndex].text = newText;
        saveTasksToStorage();
        renderTasks();
        closeEditModal();
    }
}

function closeEditModal() {
    editModal.classList.remove('active');
    editingTaskId = null;
    editInput.value = '';
}

// Delete: Remove single task
function deleteTask(id) {
    const taskElement = document.querySelector('.task-item[data-id="' + id + '"]');
    
    if (taskElement) {
        taskElement.classList.add('deleting');
        
        setTimeout(function() {
            tasks = tasks.filter(function(task) {
                return task.id !== id;
            });
            saveTasksToStorage();
            renderTasks();
            updateStats();
        }, 300);
    }
}

// Delete: Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) return;
    
    // Animate all tasks out
    const allTasks = document.querySelectorAll('.task-item');
    allTasks.forEach(function(task, index) {
        setTimeout(function() {
            task.classList.add('deleting');
        }, index * 50);
    });
    
    setTimeout(function() {
        tasks = [];
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }, allTasks.length * 50 + 300);
}

// ===== UI Feedback =====
function shakeInput() {
    taskInput.style.animation = 'none';
    taskInput.offsetHeight; // Trigger reflow
    taskInput.style.animation = 'shake 0.4s ease';
}

function shakeEditInput() {
    editInput.style.animation = 'none';
    editInput.offsetHeight; // Trigger reflow
    editInput.style.animation = 'shake 0.4s ease';
}

// Add shake animation to CSS dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-8px); }
        80% { transform: translateX(8px); }
    }
`;
document.head.appendChild(styleSheet);

// ===== Stats Update =====
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;
    const pending = total - completed;
    
    animateNumber(totalTasksEl, total);
    animateNumber(completedTasksEl, completed);
    animateNumber(pendingTasksEl, pending);
}

function animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === targetValue) return;
    
    const duration = 300;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(currentValue + (targetValue - currentValue) * easeOut);
        
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Add task on button click
    addTaskBtn.addEventListener('click', function() {
        addTask(taskInput.value);
    });
    
    // Add task on Enter key
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });
    
    // Task list event delegation
    taskList.addEventListener('click', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.id);
        
        // Checkbox click
        if (e.target.closest('.task-checkbox')) {
            toggleTask(taskId);
            return;
        }
        
        // Task text click (toggle completion)
        if (e.target.classList.contains('task-text')) {
            toggleTask(taskId);
            return;
        }
        
        // Edit button click
        if (e.target.closest('.edit-btn')) {
            openEditModal(taskId);
            return;
        }
        
        // Delete button click
        if (e.target.closest('.delete-btn')) {
            deleteTask(taskId);
            return;
        }
    });
    
    // Keyboard support for checkboxes
    taskList.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const checkbox = e.target.closest('.task-checkbox');
            if (checkbox) {
                e.preventDefault();
                const taskItem = checkbox.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                toggleTask(taskId);
            }
        }
    });
    
    // Clear all button
    clearAllBtn.addEventListener('click', clearAllTasks);
    
    // Edit modal events
    saveEditBtn.addEventListener('click', saveTaskEdit);
    
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    modalClose.addEventListener('click', closeEditModal);
    
    modalBackdrop.addEventListener('click', closeEditModal);
    
    editInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveTaskEdit();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeEditModal();
        }
    });
}

// ===== Initialize on DOM Ready =====
document.addEventListener('DOMContentLoaded', init);
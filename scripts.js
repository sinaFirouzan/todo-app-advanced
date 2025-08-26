
// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const archiveCompletedBtn = document.getElementById('archive-completed');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const mobileSearchInput = document.getElementById('mobile-search-input');
const exportBtn = document.getElementById('export-btn');
const fabBtn = document.getElementById('fab-btn');
const toastContainer = document.getElementById('toast-container');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const activeTasksEl = document.getElementById('active-tasks');
const overdueTasksEl = document.getElementById('overdue-tasks');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filteredTasks = [];
let currentFilter = 'all';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialize
if (darkMode) {
    document.documentElement.classList.add('dark');
}

// Set default due date to today
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
dueDateInput.value = `${yyyy}-${mm}-${dd}`;

// Create smoke effect
function createSmoke() {
    const smokeContainer = document.getElementById('smoke-container');
    for (let i = 0; i < 20; i++) {
        const smokeParticle = document.createElement('div');
        smokeParticle.classList.add('smoke-particle');

        // Random size
        const size = Math.random() * 100 + 50;
        smokeParticle.style.width = `${size}px`;
        smokeParticle.style.height = `${size}px`;

        // Random position
        const left = Math.random() * 100;
        smokeParticle.style.left = `${left}%`;
        smokeParticle.style.bottom = `-${size}px`;

        // Random animation duration and delay
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 10;
        smokeParticle.style.animationDuration = `${duration}s`;
        smokeParticle.style.animationDelay = `${delay}s`;

        smokeContainer.appendChild(smokeParticle);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast', 'px-4', 'py-3', 'rounded-md', 'shadow-md', 'text-white');

    switch (type) {
        case 'success':
            toast.classList.add('bg-green-500');
            break;
        case 'error':
            toast.classList.add('bg-red-500');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-500');
            break;
        default:
            toast.classList.add('bg-primary-500');
    }

    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
    renderTasks();
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    const today = new Date().toISOString().split('T')[0];

    const overdue = tasks.filter(task => {
        return !task.completed && task.dueDate && task.dueDate < today;
    }).length;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    activeTasksEl.textContent = active;
    overdueTasksEl.textContent = overdue;

    // Update progress bar
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
}

// Render tasks based on current filter
function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase() || mobileSearchInput.value.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);
        const dueToday = task.dueDate === today;
        const isOverdue = !task.completed && task.dueDate && task.dueDate < today;

        if (currentFilter === 'all') return matchesSearch;
        if (currentFilter === 'completed') return task.completed && matchesSearch;
        if (currentFilter === 'active') return !task.completed && matchesSearch;
        if (currentFilter === 'today') return dueToday && matchesSearch;
        if (currentFilter === 'overdue') return isOverdue && matchesSearch;
        return matchesSearch;
    });

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        taskList.innerHTML = '';
        taskList.appendChild(emptyState);
    } else {
        emptyState.style.display = 'none';
        taskList.innerHTML = '';

        filteredTasks.forEach((task, index) => {
            const taskElement = createTaskElement(task, index);
            taskList.appendChild(taskElement);
        });
    }
}

// Create task element
function createTaskElement(task, index) {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = !task.completed && task.dueDate && task.dueDate < today;

    const taskEl = document.createElement('div');
    taskEl.className = `task-item p-4 border-b border-gray-200 dark:border-gray-700 flex items-start animate-slide-up transition-all duration-200 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-700'}`;
    taskEl.dataset.id = task.id;
    taskEl.classList.add(`priority-${task.priority}`);

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mt-1 mr-3 h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 transition-all';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    // Task text container
    const textContainer = document.createElement('div');
    textContainer.className = 'flex-1';

    // Task text
    const taskText = document.createElement('span');
    taskText.className = `task-text ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`;
    taskText.textContent = task.text;

    // Due date and priority
    const metaContainer = document.createElement('div');
    metaContainer.className = 'flex items-center mt-1 text-xs';

    if (task.dueDate) {
        const dueDateEl = document.createElement('span');
        dueDateEl.className = `inline-flex items-center mr-3 ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`;

        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        dueDateEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    ${formattedDate}
                `;

        metaContainer.appendChild(dueDateEl);
    }

    // Priority
    const priorityEl = document.createElement('span');
    priorityEl.className = 'inline-flex items-center mr-3';

    let priorityText = '';
    let priorityColor = '';

    switch (task.priority) {
        case 'low':
            priorityText = 'Low';
            priorityColor = 'text-green-500';
            break;
        case 'medium':
            priorityText = 'Medium';
            priorityColor = 'text-yellow-500';
            break;
        case 'high':
            priorityText = 'High';
            priorityColor = 'text-red-500';
            break;
    }

    priorityEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1 ${priorityColor}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                ${priorityText}
            `;

    metaContainer.appendChild(priorityEl);

    // Actions
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'flex items-center ml-2 space-x-2';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors p-1';
    editBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            `;
    editBtn.addEventListener('click', () => editTask(task));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'text-gray-400 hover:text-red-500 transition-colors p-1';
    deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            `;
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);

    // Assemble the task element
    textContainer.appendChild(taskText);
    textContainer.appendChild(metaContainer);

    taskEl.appendChild(checkbox);
    taskEl.appendChild(textContainer);
    taskEl.appendChild(actionsContainer);

    // Add double-click to edit functionality
    taskEl.addEventListener('dblclick', () => editTask(task));

    return taskEl;
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        showToast('Task cannot be empty', 'error');
        return;
    }

    const task = {
        id: Date.now().toString(),
        text,
        completed: false,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || null,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();

    taskInput.value = '';
    showToast('Task added successfully', 'success');

    // Focus the input again for quick task entry
    taskInput.focus();
}

// Toggle task completion
function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    saveTasks();
    const action = tasks.find(t => t.id === id).completed ? 'completed' : 'marked as active';
    showToast(`Task ${action}`, 'success');
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    showToast('Task deleted', 'error');
}

// Edit task
function editTask(task) {
    const taskEl = document.querySelector(`.task-item[data-id="${task.id}"]`);
    const taskTextEl = taskEl.querySelector('.task-text');

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'w-full px-2 py-1 border border-primary-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700';
    editInput.value = task.text;

    // Replace text with input
    taskTextEl.replaceWith(editInput);
    editInput.focus();

    // Save on Enter, cancel on Escape
    const handleEdit = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            if (e.key === 'Enter') {
                const newText = editInput.value.trim();
                if (newText) {
                    tasks = tasks.map(t =>
                        t.id === task.id ? { ...t, text: newText } : t
                    );
                    saveTasks();
                    showToast('Task updated', 'success');
                }
            }

            // Restore original state
            editInput.replaceWith(taskTextEl);
            editInput.removeEventListener('keydown', handleEdit);
        }
    };

    editInput.addEventListener('keydown', handleEdit);

    // Also save when clicking outside
    editInput.addEventListener('blur', () => {
        const newText = editInput.value.trim();
        if (newText) {
            tasks = tasks.map(t =>
                t.id === task.id ? { ...t, text: newText } : t
            );
            saveTasks();
        }
        editInput.replaceWith(taskTextEl);
    });
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    showToast('Completed tasks cleared', 'success');
}

// Archive completed tasks (move them to the bottom)
function archiveCompleted() {
    const completed = tasks.filter(task => task.completed);
    const active = tasks.filter(task => !task.completed);
    tasks = [...active, ...completed];
    saveTasks();
    showToast('Completed tasks archived', 'success');
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700');
            btn.classList.add('bg-primary-500', 'text-white');
        } else {
            btn.classList.remove('bg-primary-500', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
        }
    });

    renderTasks();
}

// Export tasks
function exportTasks() {
    const data = tasks.map(task => {
        return {
            'Task': task.text,
            'Status': task.completed ? 'Completed' : 'Pending',
            'Priority': task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
            'Due Date': task.dueDate || 'No due date',
            'Created At': new Date(task.createdAt).toLocaleString()
        };
    });

    let csvContent = '';

    // Add headers
    const headers = Object.keys(data[0] || {});
    csvContent += headers.join(',') + '\n';

    // Add rows
    data.forEach(row => {
        csvContent += headers.map(header => `"${row[header]}"`).join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Tasks exported to CSV', 'success');
}

// Toggle theme
function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);

    if (darkMode) {
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                `;
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                `;
    }
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

fabBtn.addEventListener('click', () => {
    taskInput.focus();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
});

clearCompletedBtn.addEventListener('click', clearCompleted);
archiveCompletedBtn.addEventListener('click', archiveCompleted);
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', renderTasks);
mobileSearchInput.addEventListener('input', renderTasks);
exportBtn.addEventListener('click', exportTasks);

// Initialize
createSmoke();
renderTasks();
updateStats();

// Set initial theme icon
if (darkMode) {
    themeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            `;
}

// Add some sample tasks if empty
if (tasks.length === 0) {
    const sampleTasks = [
        {
            text: "Complete project presentation",
            priority: "high",
            dueDate: `${yyyy}-${mm}-${dd}`,
            completed: false
        },
        {
            text: "Morning workout session",
            priority: "medium",
            dueDate: null,
            completed: true
        },
        {
            text: "Read 30 pages of new book",
            priority: "low",
            dueDate: `${yyyy}-${mm}-${parseInt(dd) + 1}`,
            completed: false
        }
    ];

    tasks = sampleTasks.map((task, index) => ({
        id: (Date.now() + index).toString(),
        text: task.text,
        completed: task.completed,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: new Date().toISOString()
    }));

    saveTasks();
}
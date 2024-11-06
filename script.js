document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const addButton = document.getElementById('addButton');
    const todoList = document.getElementById('todoList');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.value = today;

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    function createTaskElement(task, isNew = false) {
        const taskElement = document.createElement('div');
        taskElement.className = `todo-item ${task.completed ? 'completed' : ''}`;
        if (isNew) {
            taskElement.classList.add('neth-animation');
        }

        taskElement.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" class="todo-check" ${task.completed ? 'checked' : ''}>
                <span class="todo-text">${task.text}</span>
            </div>
            <div class="todo-tags">
                <span class="tag category-${task.category}">${task.category}</span>
                <span class="tag priority-${task.priority}">${task.priority}</span>
                ${task.dueDate ? `<span class="tag">${formatDate(task.dueDate)}</span>` : ''}
            </div>
            <div class="todo-actions">
                <button class="action-btn delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        const checkbox = taskElement.querySelector('.todo-check');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            taskElement.classList.toggle('completed', task.completed);
            
            // Add a subtle animation when marking complete
            taskElement.style.transition = 'all 0.3s ease';
            if (task.completed) {
                taskElement.style.opacity = '0.8';
                taskElement.style.transform = 'scale(0.98)';
            } else {
                taskElement.style.opacity = '1';
                taskElement.style.transform = 'scale(1)';
            }
            
            saveTasks();
        });

        const deleteBtn = taskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            taskElement.classList.add('delete-animation');
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== task.id);
                renderTasks();
                saveTasks();
            }, 500);
        });

        return taskElement;
    }

    function renderTasks() {
        todoList.innerHTML = '';
        // Sort tasks by creation date (newest first) and completion status
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.completed ? 1 : -1;
        });
        
        sortedTasks.forEach(task => {
            todoList.appendChild(createTaskElement(task));
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) {
            taskInput.focus();
            return;
        }

        // Add button animation
        addButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addButton.style.transform = 'scale(1)';
        }, 100);

        const task = {
            id: Date.now(),
            text,
            category: categorySelect.value,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(task);
        
        // Clear existing tasks and add new one with animation
        todoList.innerHTML = '';
        const newTaskElement = createTaskElement(task, true);
        todoList.appendChild(newTaskElement);
        
        // Render the rest of the tasks after a small delay
        setTimeout(() => {
            tasks.slice(1).forEach(t => {
                todoList.appendChild(createTaskElement(t));
            });
        }, 100);

        saveTasks();
        taskInput.value = '';
        taskInput.focus();
    }

    // Event Listeners
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Add hover effect to add button
    addButton.addEventListener('mouseover', () => {
        addButton.style.transform = 'translateY(-2px)';
    });
    
    addButton.addEventListener('mouseout', () => {
        addButton.style.transform = 'translateY(0)';
    });

    // Initial render
    renderTasks();
});
document.addEventListener('DOMContentLoaded', () => {
    // Input Fields
    const taskInput = document.getElementById('task-input');
    const assignedToInput = document.getElementById('assigned-to-input');
    const priorityInput = document.getElementById('priority-input');
    const duedateInput = document.getElementById('duedate-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // New: Filter elements
    const assigneeFilterDropdown = document.getElementById('assignee-filter-dropdown');
    let currentFilterAssignee = null; // null means no filter
    let completionDonutChart = null;

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyB2QHgb6yQqCUsWQu_H4qauKnMoQj8iANA",
        authDomain: "chanyowl-app.firebaseapp.com",
        databaseURL: "https://chanyowl-app-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "chanyowl-app",
        storageBucket: "chanyowl-app.firebasestorage.app",
        messagingSenderId: "535389869322",
        appId: "1:535389869322:web:4b054e94bb03af4bfa16f3",
        measurementId: "G-8C6KZ51VLQ"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const tasksRef = database.ref('tasks');

    // Custom Chart.js Plugin for Centered Text
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart) => {
            if (chart.config.options.elements.center) {
                const ctx = chart.ctx;
                const centerConfig = chart.config.options.elements.center;
                const fontStyle = centerConfig.fontStyle || 'Montserrat';
                const percentageString = centerConfig.text;
                const color = centerConfig.color || '#333';
                
                ctx.save();
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic'; // Align both number and sign to this baseline

                const centerX = chart.width / 2;
                const centerY = chart.height / 2; // Midpoint of the chart canvas

                const numberValue = parseFloat(percentageString).toFixed(0);
                const percentageSign = '%';

                const baseFontSize = 40;
                const numberFontSize = baseFontSize * 1.1; // 10% bigger
                const signFontSize = baseFontSize * 0.5; // 50% smaller

                // Measure text for proper positioning
                ctx.font = `bold ${numberFontSize}px ${fontStyle}`;
                const numberWidth = ctx.measureText(numberValue).width;
                ctx.font = `bold ${signFontSize}px ${fontStyle}`;
                const signWidth = ctx.measureText(percentageSign).width;
                
                const totalTextWidth = numberWidth + signWidth;

                // Adjust for downward shift (approx 1.5mm + 1mm = 10px)
                const downwardOffset = 10;

                // Calculate vertical positioning
                const mainTextBaselineY = centerY + downwardOffset; // Start at center Y, shifted down

                // Draw number value
                ctx.font = `bold ${numberFontSize}px ${fontStyle}`;
                ctx.fillText(numberValue, centerX - (totalTextWidth / 2) + (numberWidth / 2), mainTextBaselineY);

                // Draw percentage sign, aligned on the same baseline
                ctx.font = `bold ${signFontSize}px ${fontStyle}`;
                ctx.fillText(percentageSign, centerX + (totalTextWidth / 2) - (signWidth / 2), mainTextBaselineY);

                // Draw description text below, adjusted relative to main text
                const descriptionFontSize = 12;
                const verticalGapBetweenMainAndDesc = 10; // Gap between main text baseline and description baseline
                ctx.font = `${descriptionFontSize}px ${fontStyle}`;
                const descriptionY = mainTextBaselineY + verticalGapBetweenMainAndDesc + (descriptionFontSize / 2); // Position below main text
                ctx.fillText("Completion", centerX, descriptionY);

                ctx.restore();
            }
        }
    };
    Chart.register(centerTextPlugin);

    // Populate assignee filter dropdown
    const allAssigneeOptions = ['All', ...Array.from(assignedToInput.options).map(option => option.value)];
    allAssigneeOptions.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee === 'All' ? '' : assignee; // Use empty string for "All" filter
        option.textContent = assignee;
        assigneeFilterDropdown.appendChild(option);
    });
    // Set initial display of filter dropdown
    assigneeFilterDropdown.value = ''; // Select "All" by default
    
    // Custom Confirm Modal Elements
    const confirmOverlay = document.getElementById('custom-confirm-overlay');
    const confirmModal = document.getElementById('custom-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmMsg = document.getElementById('custom-confirm-msg');
    let taskToConfirm = null;
    let confirmAction = null;

    // const STORAGE_KEY = 'tasks'; // Removed

    // --- Date Helper ---
    function formatDate(date) {
        if (!date) return 'No date';
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return 'No date';
        }

        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = d.getUTCDate().toString().padStart(2, '0');

        return `${month}/${day}/${year}`;
    }

    function createOrUpdateCompletionChart(percentage) {
        const ctx = document.getElementById('completion-chart').getContext('2d');
        
        if (completionDonutChart) {
            completionDonutChart.destroy();
        }

        completionDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In-Progress'],
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: ['#28a745', '#f0f2f5'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                elements: {
                    center: {
                        text: `${percentage.toFixed(0)}%`,
                        color: '#333',
                        fontStyle: 'Montserrat',
                        sidePadding: 20
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }
    
    function updateDashboard(tasks) {
        updateTaskCompletionPercentage(tasks);
        updateActiveTasks(tasks); // Updated function call
        updateOverdueTasks(tasks);
        updateEfficiencyScore(tasks);
        updateProductivityScore(tasks); // Updated function call
    }
    
    function updateActiveTasks(tasks) { // Renamed function
        const activeTasksPanel = document.querySelector('#dashboard-panels .panel:nth-child(3) .panel-value'); // Updated selector
        const activeTasksCount = tasks.filter(task => !task.classList.contains('completed') && !task.classList.contains('discontinued')).length;
        activeTasksPanel.textContent = activeTasksCount;
    }
    
    function updateTaskCompletionPercentage(tasks) {
        // Filter out discontinued tasks before calculating percentage
        const relevantTasks = tasks.filter(task => !task.classList.contains('discontinued'));
        
        if (relevantTasks.length === 0) {
            createOrUpdateCompletionChart(0);
            return;
        }

        const priorityWeights = {
            low: 1,
            medium: 2,
            high: 3
        };

        let totalPossiblePoints = 0;
        let completedPoints = 0;

        relevantTasks.forEach(taskRow => {
            const priority = taskRow.querySelector('.priority').textContent.toLowerCase();
            const weight = priorityWeights[priority] || 1;
            totalPossiblePoints += weight;

            if (taskRow.classList.contains('completed')) {
                completedPoints += weight;
            }
        });
        
        const percentage = (totalPossiblePoints > 0) ? (completedPoints / totalPossiblePoints) * 100 : 0;
        createOrUpdateCompletionChart(percentage);
    }

    function updateProductivityScore(tasks) {
        const completedTasks = tasks.filter(task => task.classList.contains('completed'));
        const productivityPanel = document.querySelector('#dashboard-panels .panel:nth-child(4) .panel-value'); // Updated selector

        const priorityWeights = {
            low: 1,
            medium: 2,
            high: 3
        };

        let productivityScore = 0;
        completedTasks.forEach(taskRow => {
            const priority = taskRow.querySelector('.priority').textContent.toLowerCase();
            const weight = priorityWeights[priority] || 0;
            productivityScore += weight;
        });

        productivityPanel.textContent = productivityScore;
    }

    function updateOverdueTasks(tasks) {
        const allTaskRows = tasks;
        const overduePanel = document.querySelector('#dashboard-panels .panel:nth-child(2) .panel-value');
        
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        let overdueCount = 0;
        allTaskRows.forEach(taskRow => {
            const dueDateStr = taskRow.dataset.dueDate;
            
            // Remove 'overdue' class first to re-evaluate
            taskRow.classList.remove('overdue');

            if (!taskRow.classList.contains('completed') && dueDateStr) {
                const dueDate = new Date(dueDateStr); // This is a UTC date
                if (dueDate < today) {
                    overdueCount++;
                    taskRow.classList.add('overdue');
                }
            }
        });

        overduePanel.textContent = overdueCount;
    }

    function updateEfficiencyScore(tasks) {
        const completedTasks = tasks.filter(task => task.classList.contains('completed'));
        const efficiencyPanel = document.querySelector('#dashboard-panels .panel:nth-child(1) .panel-value');
        
        if (completedTasks.length === 0) {
            efficiencyPanel.textContent = '--';
            return;
        }

        let totalEfficiency = 0;
        let numCompletedWithDates = 0;

        completedTasks.forEach(taskRow => {
            const receivedDateStr = taskRow.dataset.receivedDate;
            const dueDateStr = taskRow.dataset.dueDate;
            const completionDateStr = taskRow.dataset.completionDate;

            if (receivedDateStr && dueDateStr && completionDateStr) {
                            const receivedDate = new Date(receivedDateStr);
                            const dueDate = new Date(dueDateStr);
                            const completionDate = new Date(completionDateStr);
                
                            let plannedDurationDays = (dueDate >= receivedDate) ? Math.ceil((dueDate - receivedDate) / (1000 * 60 * 60 * 24)) : 0;
                            let actualDurationDays = (completionDate >= receivedDate) ? Math.ceil((completionDate - receivedDate) / (1000 * 60 * 60 * 24)) : 0;                
                // Ensure no zero values for calculation, treat as minimum 1 day
                plannedDurationDays = Math.max(plannedDurationDays, 1);
                actualDurationDays = Math.max(actualDurationDays, 1);
                
                const efficiency = (plannedDurationDays / actualDurationDays) * 100;
                totalEfficiency += efficiency;
                numCompletedWithDates++;
            }
        });

        const averageEfficiency = (numCompletedWithDates > 0) ? totalEfficiency / numCompletedWithDates : 0;
        efficiencyPanel.innerHTML = `${averageEfficiency.toFixed(0)}<span class="percent-sign">%</span>`;
    }

    function saveTasks() {
        // This function is no longer needed as Firebase handles saving directly
        // Individual task modifications will interact with tasksRef
    }

    function refreshDashboardAndFilters() {
        const selectedAssignee = assigneeFilterDropdown.value;
        const allTasks = Array.from(document.querySelectorAll('.task-row'));
        let tasksForDashboard = allTasks;

        if (selectedAssignee && selectedAssignee !== '') {
            tasksForDashboard = allTasks.filter(task => task.dataset.assignee === selectedAssignee);
        }
        
        // This function handles showing/hiding rows.
        filterTasksByAssignee(selectedAssignee); 
        
        // This function updates the dashboard panels.
        updateDashboard(tasksForDashboard);
    }

    function loadTasks() {
        tasksRef.on('value', (snapshot) => {
            taskList.innerHTML = ''; // Clear current tasks in DOM
            const tasksData = snapshot.val();
            if (tasksData) {
                // Convert Firebase object to array of tasks with IDs
                const tasksArray = Object.keys(tasksData).map(key => ({
                    id: key, // Store Firebase key as task ID
                    ...tasksData[key]
                }));
                // Sort tasks by receivedDate descending (newest receivedDate first)
                tasksArray.sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

                tasksArray.forEach(task => {
                    const newTaskRow = createTask(task); // createTask will use task.id
                    if (task.isCompleted) {
                        newTaskRow.classList.add('completed');
                    }
                    if (task.status === 'discontinued') {
                        newTaskRow.classList.add('discontinued');
                    }
                    if (task.completionDate) {
                        newTaskRow.dataset.completionDate = task.completionDate;
                    }
                    taskList.appendChild(newTaskRow); // Use appendChild
                    recalculateDuration(newTaskRow);
                });
            }
            refreshDashboardAndFilters();
        }, (error) => {
            console.error("Error fetching tasks from Firebase:", error);
            // Optionally, display an error message to the user
            alert("Failed to load tasks. Please check your internet connection.");
        });
    }

    function createTask(task) {
        const taskRow = document.createElement('div');
        taskRow.className = 'task-row';
        taskRow.dataset.id = task.id; // Store Firebase ID
        taskRow.dataset.receivedDate = task.receivedDate;
        taskRow.dataset.dueDate = task.dueDate || '';
        taskRow.dataset.assignee = task.assignedTo; // Add data-assignee attribute

        // Cells
        const textCell = document.createElement('div');
        textCell.className = 'task-cell task-text';
        textCell.textContent = task.text;

        const assignedToCell = document.createElement('div');
        assignedToCell.className = 'task-cell';
        assignedToCell.textContent = task.assignedTo;
        
        const receivedCell = document.createElement('div');
        receivedCell.className = 'task-cell received-date';
        const receivedDateSpan = document.createElement('span');
        receivedDateSpan.className = 'editable-date-text';
        receivedDateSpan.textContent = formatDate(task.receivedDate);
        receivedCell.appendChild(receivedDateSpan);
        receivedDateSpan.addEventListener('click', () => editDate(receivedCell, 'receivedDate'));

        const dueDateCell = document.createElement('div');
        dueDateCell.className = 'task-cell due-date';
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'editable-date-text';
        dueDateSpan.textContent = formatDate(task.dueDate);
        dueDateCell.appendChild(dueDateSpan);
        dueDateSpan.addEventListener('click', () => editDate(dueDateCell, 'dueDate'));
        
        const priorityCell = document.createElement('div');
        priorityCell.className = 'task-cell';
        const prioritySpan = document.createElement('span');
        prioritySpan.className = `priority priority-${task.priority}`;
        prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        priorityCell.appendChild(prioritySpan);

        const urlCell = document.createElement('div');
        urlCell.className = 'task-cell url-cell';
        if (task.url) {
            const link = document.createElement('a');
            link.href = task.url;
            link.textContent = 'Link';
            link.target = '_blank';
            urlCell.appendChild(link);
        } else {
            urlCell.textContent = 'Add Link';
        }
        urlCell.addEventListener('click', () => editUrl(urlCell));

        const durationCell = document.createElement('div');
        durationCell.className = 'task-cell duration';

        const actionsCell = document.createElement('div');
        actionsCell.className = 'task-cell task-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.innerHTML = '&#x2713;';
        completeBtn.addEventListener('click', () => toggleComplete(taskRow));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&#x1F5D1;';
        deleteBtn.addEventListener('click', () => deleteTask(taskRow));

        const discontinueBtn = document.createElement('button');
        discontinueBtn.className = 'discontinue-btn';
        discontinueBtn.innerHTML = '&#9208;'; // Pause symbol
        discontinueBtn.addEventListener('click', () => discontinueTask(taskRow));

        actionsCell.appendChild(completeBtn);
        actionsCell.appendChild(discontinueBtn);
        actionsCell.appendChild(deleteBtn);

        // Append cells
        taskRow.appendChild(textCell);
        taskRow.appendChild(assignedToCell);
        taskRow.appendChild(receivedCell);
        taskRow.appendChild(dueDateCell);
        taskRow.appendChild(priorityCell);
        taskRow.appendChild(urlCell);
        taskRow.appendChild(durationCell);
        taskRow.appendChild(actionsCell);

        return taskRow;
    }

    function filterTasksByAssignee(assignee) {
        currentFilterAssignee = assignee === '' ? null : assignee;

        const allTaskRows = document.querySelectorAll('.task-row');
        allTaskRows.forEach(taskRow => {
            const assignedToText = taskRow.dataset.assignee;
            if (currentFilterAssignee === null || assignedToText === currentFilterAssignee) {
                taskRow.style.display = 'grid';
            }
            else {
                taskRow.style.display = 'none';
            }
        });
    }

    function addTask() {
        if (taskInput.value.trim() === '') {
            alert('Please enter a task name.');
            return;
        }
        const now = new Date();
        const receivedDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

        let dueDate = '';
        if (duedateInput.value) {
            const dateParts = duedateInput.value.split('-');
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);
            dueDate = new Date(Date.UTC(year, month, day)).toISOString();
        }

        const task = {
            text: taskInput.value.trim(),
            assignedTo: assignedToInput.value.trim() || 'Unassigned',
            priority: priorityInput.value,
            dueDate: dueDate,
            url: '',
            receivedDate: receivedDate,
            isCompleted: false
        };
        
        tasksRef.push(task)
            .then(() => {
                // Clear inputs after successful push
                taskInput.value = '';
                assignedToInput.value = '';
                priorityInput.value = 'low';
                duedateInput.value = '';
                taskInput.focus();
            })
            .catch((error) => {
                console.error("Error adding task:", error);
                alert("Failed to add task. Please try again.");
            });
    }

    function editUrl(cell) {
        const taskRow = cell.parentElement.parentElement; // Get the task row
        const taskId = taskRow.dataset.id; // Get task ID

        const currentLink = cell.querySelector('a');
        const currentUrl = currentLink ? currentLink.href : '';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'url-input';
        input.value = currentUrl;
        
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();

        const save = () => {
            const newUrl = input.value.trim();
            // Only update Firebase if the URL actually changed
            if (newUrl !== currentUrl) { 
                tasksRef.child(taskId).update({ url: newUrl })
                    .catch((error) => {
                        console.error("Error updating URL:", error);
                        alert("Failed to update URL. Please try again.");
                    });
            }
            // UI update handled by Firebase listener
        };

        input.addEventListener('blur', save);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    }

    function editDate(cell, dateType) {
        const taskRow = cell.parentElement;
        const taskId = taskRow.dataset.id; // Get task ID
        const originalISODate = taskRow.dataset[dateType];
        
        // Helper to format date for input type="date" (YYYY-MM-DD)
        const formatDateForInput = (date) => {
            if (!date) return '';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            
            const year = d.getUTCFullYear();
            const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
            const day = d.getUTCDate().toString().padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        }

        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'date-input';
        input.value = formatDateForInput(originalISODate);
        
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();

        const save = () => {
            // Restore original display only, Firebase listener will re-render if data changes
            const restoreOriginalDisplay = (isoDate) => {
                cell.innerHTML = '';
                const dateSpan = document.createElement('span');
                dateSpan.className = 'editable-date-text';
                dateSpan.textContent = formatDate(isoDate);
                dateSpan.addEventListener('click', () => editDate(cell, dateType));
                cell.appendChild(dateSpan);
            };

            // If the input is empty when saving, restore the original date
            if (!input.value) {
                restoreOriginalDisplay(originalISODate);
                return;
            }

            const dateParts = input.value.split('-');
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // month is 0-indexed
            const day = parseInt(dateParts[2], 10);
            const newDate = new Date(Date.UTC(year, month, day)).toISOString();
            
            // Only update Firebase if the date actually changed
            if (newDate !== originalISODate) {
                tasksRef.child(taskId).update({ [dateType]: newDate })
                    .catch((error) => {
                        console.error(`Error updating ${dateType}:`, error);
                        alert(`Failed to update ${dateType}. Please try again.`);
                    });
            } else {
                restoreOriginalDisplay(originalISODate); // Restore display if no change
            }
            // UI update handled by Firebase listener
        };

        input.addEventListener('blur', save, { once: true });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    function recalculateDuration(taskRow) {
        const durationCell = taskRow.querySelector('.duration');
        const receivedDateStr = taskRow.dataset.receivedDate;
        const dueDateStr = taskRow.dataset.dueDate;
        const completionDateStr = taskRow.dataset.completionDate; // Get completion date
        
        let plannedDurationDays = '--';

        if (receivedDateStr && dueDateStr) {
            const receivedParts = receivedDateStr.split('T')[0].split('-');
            const dueParts = dueDateStr.split('T')[0].split('-');

            const receivedDate = new Date(Date.UTC(receivedParts[0], receivedParts[1] - 1, receivedParts[2]));
            const dueDate = new Date(Date.UTC(dueParts[0], dueParts[1] - 1, dueParts[2]));
            
            if (dueDate >= receivedDate) {
                const diffTime = dueDate.getTime() - receivedDate.getTime();
                plannedDurationDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            }
        }

        if (taskRow.classList.contains('completed') && receivedDateStr && completionDateStr) {
            const receivedParts = receivedDateStr.split('T')[0].split('-');
            const completionParts = completionDateStr.split('T')[0].split('-');

            const receivedDate = new Date(Date.UTC(receivedParts[0], receivedParts[1] - 1, receivedParts[2]));
            const completionDate = new Date(Date.UTC(completionParts[0], completionParts[1] - 1, completionParts[2]));

            let actualDurationDays = 0;
            if (completionDate >= receivedDate) {
                const diffTime = completionDate.getTime() - receivedDate.getTime();
                actualDurationDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            }
            
            durationCell.textContent = `${plannedDurationDays}/${actualDurationDays} day(s)`;
        } else {
            durationCell.textContent = `${plannedDurationDays} day(s)`;
        }
    }

    function toggleComplete(taskRow) {
        taskToConfirm = taskRow;
        const isCompleted = taskRow.classList.contains('completed');
        confirmMsg.textContent = isCompleted ? 'Are you sure you want to mark this task as not complete?' : 'Are you sure you want to mark this task as complete?';
        
        confirmAction = () => {
            const taskId = taskRow.dataset.id;
            const newIsCompleted = !isCompleted;
            const completionDate = newIsCompleted ? new Date().toISOString() : null;

            tasksRef.child(taskId).update({ isCompleted: newIsCompleted, completionDate: completionDate })
                .catch((error) => {
                    console.error("Error toggling task completion:", error);
                    alert("Failed to update task status. Please try again.");
                });
        };

        confirmOverlay.classList.remove('hidden');
    }

    function discontinueTask(taskRow) {
        taskToConfirm = taskRow;
        const isDiscontinued = taskRow.classList.contains('discontinued');
        confirmMsg.textContent = isDiscontinued ? 'Are you sure you want to reactivate this task?' : 'Are you sure you want to discontinue this task?';
        
        confirmAction = () => {
            const taskId = taskRow.dataset.id;
            const newStatus = isDiscontinued ? 'active' : 'discontinued';

            tasksRef.child(taskId).update({ status: newStatus })
                .catch((error) => {
                    console.error("Error updating task status:", error);
                    alert("Failed to update task status. Please try again.");
                });
        };

        confirmOverlay.classList.remove('hidden');
    }

    function deleteTask(taskRow) {
        taskToConfirm = taskRow;
        confirmMsg.textContent = 'Are you sure you want to delete this task?';

        confirmAction = () => {
            const taskId = taskRow.dataset.id;
            tasksRef.child(taskId).remove()
                .then(() => {
                    // Task removed from Firebase, UI update handled by listener
                })
                .catch((error) => {
                    console.error("Error deleting task:", error);
                    alert("Failed to delete task. Please try again.");
                });
        };

        confirmOverlay.classList.remove('hidden');
    }

    function hideConfirmModal() {
        confirmOverlay.classList.add('hidden');
        taskToConfirm = null;
        confirmAction = null;
    }

    function executeConfirmAction() {
        if (confirmAction) {
            confirmAction();
        }
        hideConfirmModal();
    }
    
    // Initial Load
    loadTasks();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    confirmDeleteBtn.addEventListener('click', executeConfirmAction);
    cancelDeleteBtn.addEventListener('click', hideConfirmModal);
    confirmOverlay.addEventListener('click', (e) => {
        if (e.target === confirmOverlay) {
            hideConfirmModal();
        }
    });

    // Fullscreen Toggle
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const appElement = document.getElementById('app');

    fullscreenToggle.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            appElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
    });

    assigneeFilterDropdown.addEventListener('change', () => {
        refreshDashboardAndFilters();
    });
});

import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  sideBarDiv: document.getElementById("side-bar-div"),
  logo: document.getElementById("logo"),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  switchInput: document.getElementById("switch"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  header: document.getElementById("header"),
  headerBoardName: document.getElementById("header-board-name"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  editBoardDiv: document.getElementById("editBoardDiv"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),
  todoTasksContainer: document.querySelector(
    '.column-div[data-status="todo"] .tasks-container'
  ),
  doingTasksContainer: document.querySelector(
    '.column-div[data-status="doing"] .tasks-container'
  ),
  doneTasksContainer: document.querySelector(
    '.column-div[data-status="done"] .tasks-container'
  ),
  newTaskModalWindow: document.getElementById("new-task-modal-window"),
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
};

// Adding filterDiv property
elements.filterDiv = document.getElementById("filterDiv");

let activeBoard = "";

// Extracts unique board names from tasks
// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);

  // Select column divs and assign them to elements.columnDivs
  elements.columnDivs = document.querySelectorAll('.column-div');

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; // Fix missing ternary operator colon
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}


// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      // Fix click event syntax
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Fix missing semicolon
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName); // Use strict equality operator (===) for comparison

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        // Use strict equality operator (===) for comparison
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          // Fix click event syntax
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    // Use forEach instead of foreach
    if (btn.textContent === boardName) {
      btn.classList.add("active"); // Use classList.add to add a class
    } else {
      btn.classList.remove("active"); // Use classList.remove to remove a class
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  ); // Use backticks for template literals
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement); // Add taskElement as child
}

function setupEventListeners() {
  // Theme toggle event listener
  const switchInput = document.getElementById("switch");
  switchInput.addEventListener("change", toggleTheme);

  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  const hideSideBarBtn = document.getElementById("hide-side-bar-btn");
  const showSideBarBtn = document.getElementById("show-side-bar-btn");
  hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Show Add New Task Modal event listener
  const createNewTaskBtn = document.getElementById("add-new-task-btn");
  createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  const newTaskModalWindow = document.getElementById("new-task-modal-window");
  newTaskModalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
function toggleModal(show, modal = null) {
  modal = modal || elements.newTaskModalWindow; // Use newTaskModalWindow as default modal
  modal.style.display = show ? "block" : "none"; // Use ternary operator to set display property
}

//**********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  const task = {
    title: elements.titleInput.value, // Get title from title input element
    description: elements.descInput.value, // Get description from description input element
    status: elements.selectStatus.value, // Get status from select input element
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset(); // Reset the form
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sideBarDiv = document.getElementById("side-bar-div");
  const showSideBarBtn = document.getElementById("show-side-bar-btn");
  if (show) {
    sideBarDiv.style.display = "block";
    showSideBarBtn.style.display = "none"; // Hide the button when the sidebar is shown
  } else {
    sideBarDiv.style.display = "none";
    showSideBarBtn.style.display = "block"; // Show the button when the sidebar is hidden
  }
}

// Function to toggle between light and dark themes
function toggleTheme() {
  const body = document.body;
  const switchInput = document.getElementById("switch");
  if (switchInput.checked) {
    // Switch to light mode
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    localStorage.setItem("theme", "light"); // Store theme preference in localStorage
  } else {
    // Switch to dark mode
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark"); // Store theme preference in localStorage
  }
}

function loadTheme() {
  const theme = localStorage.getItem("theme");
  const body = document.body;
  const switchInput = document.getElementById("switch");
  if (theme === "dark") {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    switchInput.checked = true; // Set the switch input to checked
  } else {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    switchInput.checked = false; // Set the switch input to unchecked
  }
}

// Call the loadTheme function when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadTheme);


function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener("click", function () {
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener("click", function () {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
  });

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = elements.editTaskTitleInput.value;
  const updatedDescription = elements.editTaskDescInput.value;
  const updatedStatus = elements.editSelectStatus.value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    // Add other properties if needed
  };

  // Update task using a helper function
  patchTask(updatedTask); // Assuming you have a function to patch/update task details

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
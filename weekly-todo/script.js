const DAYS = [
  { id: "mon", title: "Понедельник", kicker: "Старт", accent: "#00a8ff" },
  { id: "tue", title: "Вторник", kicker: "Фокус", accent: "#7c3aed" },
  { id: "wed", title: "Среда", kicker: "Ритм", accent: "#ff4d6d" },
  { id: "thu", title: "Четверг", kicker: "Темп", accent: "#f97316" },
  { id: "fri", title: "Пятница", kicker: "Финиш", accent: "#22c55e" },
  { id: "sat", title: "Суббота", kicker: "Личное", accent: "#eab308" },
  { id: "sun", title: "Воскресенье", kicker: "Пауза", accent: "#14b8a6" },
];

const STORAGE_KEY = "weekly-todo.tasks.v1";

const weekGrid = document.querySelector("#weekGrid");
const dayTemplate = document.querySelector("#dayTemplate");
const taskInput = document.querySelector("#taskInput");
const daySelect = document.querySelector("#daySelect");
const addTaskButton = document.querySelector("#addTask");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleTasks = [
  { id: createId(), day: "mon", text: "Определить главные задачи недели", done: false },
  { id: createId(), day: "wed", text: "Проверить промежуточный прогресс", done: false },
  { id: createId(), day: "fri", text: "Закрыть хвосты и подвести итоги", done: false },
];

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : sampleTasks;
  } catch {
    return sampleTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createDayOptions() {
  DAYS.forEach((day) => {
    const option = document.createElement("option");
    option.value = day.id;
    option.textContent = day.title;
    daySelect.append(option);
  });
}

function renderWeek() {
  weekGrid.replaceChildren();

  DAYS.forEach((day) => {
    const node = dayTemplate.content.firstElementChild.cloneNode(true);
    node.style.setProperty("--accent", day.accent);
    node.dataset.day = day.id;
    node.querySelector(".day-kicker").textContent = day.kicker;
    node.querySelector("h2").textContent = day.title;

    const list = node.querySelector(".task-list");
    const dayTasks = tasks.filter((task) => task.day === day.id);
    node.querySelector(".day-count").textContent = dayTasks.length;

    dayTasks.forEach((task) => list.append(createTaskElement(task)));

    const form = node.querySelector(".quick-add");
    const input = form.querySelector("input");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      addTask(input.value, day.id);
      input.value = "";
    });

    weekGrid.append(node);
  });

  updateProgress();
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task${task.done ? " done" : ""}`;
  item.dataset.id = task.id;

  const check = document.createElement("button");
  check.type = "button";
  check.className = "check";
  check.textContent = "✓";
  check.setAttribute("aria-label", task.done ? "Вернуть задачу в работу" : "Отметить выполненной");
  check.addEventListener("click", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Удалить задачу");
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(check, text, remove);
  return item;
}

function addTask(text, day) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return;
  }

  tasks = [
    ...tasks,
    {
      id: createId(),
      day,
      text: trimmedText,
      done: false,
    },
  ];
  saveTasks();
  renderWeek();
}

function toggleTask(id) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  saveTasks();
  renderWeek();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderWeek();
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressText.textContent = `${done} из ${total} выполнено`;
  progressBar.style.width = `${percent}%`;
}

addTaskButton.addEventListener("click", () => {
  addTask(taskInput.value, daySelect.value);
  taskInput.value = "";
  taskInput.focus();
});

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTaskButton.click();
  }
});

createDayOptions();
renderWeek();

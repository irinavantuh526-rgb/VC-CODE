const DAYS = [
  { id: "mon", title: "\u041f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a" },
  { id: "tue", title: "\u0412\u0442\u043e\u0440\u043d\u0438\u043a" },
  { id: "wed", title: "\u0421\u0440\u0435\u0434\u0430" },
  { id: "thu", title: "\u0427\u0435\u0442\u0432\u0435\u0440\u0433" },
  { id: "fri", title: "\u041f\u044f\u0442\u043d\u0438\u0446\u0430" },
  { id: "sat", title: "\u0421\u0443\u0431\u0431\u043e\u0442\u0430" },
  { id: "sun", title: "\u0412\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435" },
];

const CATEGORIES = [
  { id: "business", title: "\u0411\u0438\u0437\u043d\u0435\u0441-\u0437\u0430\u0434\u0430\u0447\u0438", accent: "#4f7f70" },
  { id: "personal", title: "\u041b\u0438\u0447\u043d\u044b\u0435", accent: "#a2794a" },
  { id: "study", title: "\u0423\u0447\u0435\u0431\u043d\u044b\u0435", accent: "#4d73a8" },
];

const SCORE_OPTIONS = [
  { value: 1, label: "1 - \u0441\u043b\u0430\u0431\u043e" },
  { value: 2, label: "2 - \u043d\u0438\u0437\u043a\u043e" },
  { value: 3, label: "3 - \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e" },
  { value: 4, label: "4 - \u0442\u0435\u043f\u043b\u043e \u0438 \u044d\u043d\u0435\u0440\u0433\u0438\u044f" },
  { value: 5, label: "5 - \u043e\u0442\u043b\u0438\u0447\u043d\u043e" },
];

const STORAGE_KEY = "weekly-todo.tasks.v1";
const REFLECTION_KEY = "weekly-todo.reflection.v1";

const weekGrid = document.querySelector("#weekGrid");
const dayTemplate = document.querySelector("#dayTemplate");
const categoryTemplate = document.querySelector("#categoryTemplate");
const reflectionTemplate = document.querySelector("#reflectionTemplate");
const taskInput = document.querySelector("#taskInput");
const daySelect = document.querySelector("#daySelect");
const categorySelect = document.querySelector("#categorySelect");
const addTaskButton = document.querySelector("#addTask");
const progressRatio = document.querySelector("#progressRatio");
const progressPercent = document.querySelector("#progressPercent");
const progressBar = document.querySelector("#progressBar");

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleTasks = [
  { id: createId(), day: "mon", category: "personal", text: "\u0421\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043f\u043b\u0430\u043d \u043d\u0435\u0434\u0435\u043b\u0438", done: true },
  { id: createId(), day: "wed", category: "business", text: "\u041f\u0440\u043e\u0432\u0435\u0441\u0442\u0438 \u0432\u0441\u0442\u0440\u0435\u0447\u0443", done: true },
  { id: createId(), day: "wed", category: "personal", text: "\u0412\u044b\u0434\u0435\u043b\u0438\u0442\u044c \u0432\u0440\u0435\u043c\u044f \u043d\u0430 \u0432\u0430\u0436\u043d\u0443\u044e \u0437\u0430\u0434\u0430\u0447\u0443", done: false },
  { id: createId(), day: "wed", category: "study", text: "\u0420\u0435\u0448\u0438\u0442\u044c \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u0443 \u0441 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u043e\u0439 Codex \u0432 VS Code", done: true },
  { id: createId(), day: "fri", category: "personal", text: "\u041f\u043e\u0434\u0432\u0435\u0441\u0442\u0438 \u0438\u0442\u043e\u0433\u0438", done: false },
  { id: createId(), day: "sat", category: "personal", text: "\u0417\u0430\u0431\u0435\u0433 \u0420\u0424!", done: false },
];

let tasks = loadTasks();
let reflection = loadReflection();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) {
      return sampleTasks;
    }

    if (hasBrokenSampleTasks(saved)) {
      return sampleTasks;
    }

    return saved.map(normalizeTask);
  } catch {
    return sampleTasks;
  }
}

function normalizeTask(task) {
  return {
    id: task.id || createId(),
    day: DAYS.some((day) => day.id === task.day) ? task.day : "mon",
    category: CATEGORIES.some((category) => category.id === task.category) ? task.category : "business",
    text: String(task.text || "").trim(),
    done: Boolean(task.done),
  };
}

function hasBrokenSampleTasks(savedTasks) {
  const sampleDays = new Set(["mon", "wed", "fri"]);
  return (
    savedTasks.length === 3 &&
    savedTasks.every((task) => sampleDays.has(task.day) && /[\u0420\u0421][\u0400-\u04ff]/.test(task.text))
  );
}

function loadReflection() {
  try {
    const saved = JSON.parse(localStorage.getItem(REFLECTION_KEY));
    return {
      productivity: Number(saved?.productivity) || 3,
      energy: Number(saved?.energy) || 4,
    };
  } catch {
    return { productivity: 3, energy: 4 };
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveReflection() {
  localStorage.setItem(REFLECTION_KEY, JSON.stringify(reflection));
}

function createOptions() {
  DAYS.forEach((day) => {
    daySelect.append(createOption(day.id, day.title));
  });

  CATEGORIES.forEach((category) => {
    categorySelect.append(createOption(category.id, category.title));
  });
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function renderWeek() {
  weekGrid.replaceChildren();

  DAYS.forEach((day) => {
    const node = dayTemplate.content.firstElementChild.cloneNode(true);
    const dayTasks = tasks.filter((task) => task.day === day.id);

    node.dataset.day = day.id;
    node.querySelector("h2").textContent = day.title;
    node.querySelector(".day-count").textContent = dayTasks.length;

    const categoryList = node.querySelector(".category-list");
    CATEGORIES.forEach((category) => {
      const categoryNode = createCategoryElement(day.id, category, dayTasks);
      categoryList.append(categoryNode);
    });

    weekGrid.append(node);
  });

  weekGrid.append(createReflectionElement());
  updateProgress();
}

function createCategoryElement(dayId, category, dayTasks) {
  const node = categoryTemplate.content.firstElementChild.cloneNode(true);
  const categoryTasks = dayTasks.filter((task) => task.category === category.id);

  node.style.setProperty("--category-accent", category.accent);
  node.querySelector(".category-name").textContent = category.title;
  node.querySelector(".category-count").textContent = categoryTasks.length;

  const list = node.querySelector(".task-list");
  const emptyState = node.querySelector(".empty-state");

  categoryTasks.forEach((task) => list.append(createTaskElement(task)));
  emptyState.hidden = categoryTasks.length > 0;

  node.addEventListener("dblclick", () => {
    daySelect.value = dayId;
    categorySelect.value = category.id;
    taskInput.focus();
  });

  return node;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task${task.done ? " done" : ""}`;
  item.dataset.id = task.id;

  const check = document.createElement("button");
  check.type = "button";
  check.className = "check";
  check.textContent = "\u2713";
  check.setAttribute("aria-label", task.done ? "\u0412\u0435\u0440\u043d\u0443\u0442\u044c \u0437\u0430\u0434\u0430\u0447\u0443 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443" : "\u041e\u0442\u043c\u0435\u0442\u0438\u0442\u044c \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043d\u043e\u0439");
  check.addEventListener("click", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.textContent = "\u00d7";
  remove.setAttribute("aria-label", "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u0434\u0430\u0447\u0443");
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(check, text, remove);
  return item;
}

function createReflectionElement() {
  const node = reflectionTemplate.content.firstElementChild.cloneNode(true);
  const productivitySelect = node.querySelector("#productivityScore");
  const energySelect = node.querySelector("#energyScore");

  SCORE_OPTIONS.forEach((score) => {
    productivitySelect.append(createOption(score.value, score.label));
    energySelect.append(createOption(score.value, score.label));
  });

  productivitySelect.value = reflection.productivity;
  energySelect.value = reflection.energy;

  const updateReflection = () => {
    reflection = {
      productivity: Number(productivitySelect.value),
      energy: Number(energySelect.value),
    };
    saveReflection();
    updateAverageScore(node);
  };

  productivitySelect.addEventListener("change", updateReflection);
  energySelect.addEventListener("change", updateReflection);
  updateAverageScore(node);

  return node;
}

function updateAverageScore(node) {
  const average = ((reflection.productivity + reflection.energy) / 2).toFixed(1);
  node.querySelector("#averageScore").textContent = `\u0421\u0440\u0435\u0434\u043d\u044f\u044f \u043e\u0446\u0435\u043d\u043a\u0430: ${average}/5`;
}

function addTask(text, day, category) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return;
  }

  tasks = [
    ...tasks,
    {
      id: createId(),
      day,
      category,
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

  progressRatio.textContent = `${done} \u0438\u0437 ${total} \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u043e`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

addTaskButton.addEventListener("click", () => {
  addTask(taskInput.value, daySelect.value, categorySelect.value);
  taskInput.value = "";
  taskInput.focus();
});

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTaskButton.click();
  }
});

createOptions();
renderWeek();

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const errorEl = document.getElementById("error");
const list = document.getElementById("task-list");
const emptyEl = document.getElementById("empty");
const counter = document.getElementById("counter");
const filterBtns = document.querySelectorAll(".filter");
const clearBtn = document.getElementById("clear-completed");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingId = null;

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ADD
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) {
    errorEl.textContent = "Please enter a task.";
    return;
  }
  errorEl.textContent = "";
  tasks.push({ id: Date.now(), text, completed: false });
  input.value = "";
  save();
  render();
});

// FILTER
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

// CLEAR COMPLETED
clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  save();
  render();
});

// TOGGLE / DELETE / EDIT (event delegation)
list.addEventListener("click", (e) => {
  const li = e.target.closest(".task");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.matches(".btn-delete")) {
    tasks = tasks.filter((t) => t.id !== id);
  } else if (e.target.matches(".btn-edit")) {
    editingId = id;
  } else if (e.target.matches(".btn-save")) {
    const val = li.querySelector(".edit-input").value.trim();
    if (val) tasks.find((t) => t.id === id).text = val;
    editingId = null;
  } else if (e.target.matches(".btn-cancel")) {
    editingId = null;
  } else {
    return;
  }
  save();
  render();
});

list.addEventListener("change", (e) => {
  if (e.target.matches("input[type=checkbox]")) {
    const id = Number(e.target.closest(".task").dataset.id);
    const task = tasks.find((t) => t.id === id);
    task.completed = e.target.checked;
    save();
    render();
  }
});

function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function render() {
  const visible = tasks.filter((t) =>
    currentFilter === "all" ? true : currentFilter === "active" ? !t.completed : t.completed
  );

  list.innerHTML = visible
    .map((t) => {
      const check = `<input type="checkbox" ${t.completed ? "checked" : ""} aria-label="Mark complete">`;
      if (t.id === editingId) {
        return `<li class="task" data-id="${t.id}">
          ${check}
          <input class="edit-input" value="${escapeHTML(t.text)}">
          <div class="actions">
            <button class="btn-edit btn-save">Save</button>
            <button class="btn-delete btn-cancel">Cancel</button>
          </div></li>`;
      }
      return `<li class="task ${t.completed ? "done" : ""}" data-id="${t.id}">
        ${check}
        <span class="text">${escapeHTML(t.text)}</span>
        <div class="actions">
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </div></li>`;
    })
    .join("");

  emptyEl.style.display = visible.length ? "none" : "block";
  const left = tasks.filter((t) => !t.completed).length;
  counter.textContent = `${left} task${left === 1 ? "" : "s"} left`;
  clearBtn.style.display = tasks.some((t) => t.completed) ? "inline" : "none";

  const editField = list.querySelector(".edit-input");
  if (editField) editField.focus();
}

render();
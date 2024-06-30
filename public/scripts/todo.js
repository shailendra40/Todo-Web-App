// public/scripts/todo.js
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-title');
const todoList = document.getElementById('todo-list');

// Function to render todos
function renderTodos() {
  fetch('/todos')
    .then(response => response.json())
    .then(todos => {
      todoList.innerHTML = '';
      todos.forEach(todo => {
        const li = document.createElement('li');
        li.textContent = todo.title;
        todoList.appendChild(li);
      });
    });
}

// Event listener for form submission
todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (title) {
    fetch('/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })
      .then(response => response.json())
      .then(newTodo => {
        todoInput.value = '';
        renderTodos();
      });
  }
});

// Initial rendering of todos
renderTodos();

const express = require('express');
const router = express.Router();
const { Todo } = require('../models');

// Create a new todo
router.post('/todos', async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    const newTodo = await Todo.create({ title, description, dueDate, priority });
    res.json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all todos
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.findAll();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a todo
router.put('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, status, dueDate, priority } = req.body;
    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    todo.title = title;
    todo.description = description;
    todo.status = status;
    todo.dueDate = dueDate;
    todo.priority = priority;
    await todo.save();
    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a todo
router.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    await todo.destroy();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

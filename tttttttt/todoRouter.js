// todoRouter.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all todos or filter based on status
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let todos;
    if (status) {
      todos = await prisma.todo.findMany({
        where: {
          status: status.toLowerCase(),
        },
      });
    } else {
      todos = await prisma.todo.findMany();
    }
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single todo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new todo
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    const newTodo = await prisma.todo.create({
      data: {
        title,
        description,
        dueDate,
        priority,
      },
    });
    res.json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a todo
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, status, dueDate, priority } = req.body;
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { title, description, status, dueDate, priority },
    });
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.todo.delete({ where: { id } });
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

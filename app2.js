const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Validation middleware for creating a todo
const validateCreateTodo = (req, res, next) => {
    const { title, description, dueDate, priority, status } = req.body;
    if (
      typeof title !== 'string' ||
      typeof description !== 'string' ||
      typeof status !== 'string' ||
      typeof priority !== 'string' ||
      !isStringOnly(title) ||
      !isStringOnly(description) ||
      !isStringOnly(status) ||
      !isStringOnly(priority)||
      !isValidStatus(status) ||
      !isValidPriority(priority)
    ) {
      return res
        .status(400)
        .json({ error: 'Title, description, status, and priority must be strings' });
    }
    if (title.length < 4) {
      return res.status(400).json({ error: 'Title should be at least 4 characters long' });
    }
    if (description.length < 10) {
      return res
        .status(400)
        .json({ error: 'Description should be at least 10 characters long' });
    }
    if (new Date(dueDate) <= new Date()) {
      return res.status(400).json({ error: 'Due date should be greater than the current date' });
    }
    next();
  };
  
  // Validation method to check if a string contains only alphabets and whitespaces
  const isStringOnly = (str) => {
    return /^[A-Za-z\s]+$/.test(str);
  };

// Create a new todo
app.post('/todos', validateCreateTodo, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    const newTodo = await prisma.todo.create({
      data: {
        title,
        description,
        dueDate,
        priority,
        status,
      },
    });
    res.json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single todo by ID
app.get('/todos/:id', async (req, res) => {
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

// Get all todos or filter based on status and priority
app.get('/todos', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let todos;
    if (status && priority) {
      todos = await prisma.todo.findMany({
        where: {
          status: status.toLowerCase(),
          priority: priority.toLowerCase(),
        },
      });
    } else if (status) {
      todos = await prisma.todo.findMany({
        where: {
          status: status.toLowerCase(),
        },
      });
    } else if (priority) {
      todos = await prisma.todo.findMany({
        where: {
          priority: priority.toLowerCase(),
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

// Update a todo
app.put('/todos/:id', validateCreateTodo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTodo = await prisma.todo.findUnique({
        where: { id },
      });
  
      if (!existingTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      const { title, description, } = req.body;
      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: {
          title: title || existingTodo.title,
          description: description || existingTodo.description,
          status: existingTodo.status,
          dueDate: existingTodo.dueDate,
          priority: existingTodo.priority,
        },
      });
      res.json(updatedTodo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });  

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.todo.delete({ where: { id } });
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

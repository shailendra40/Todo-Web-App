// app.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Create a new todo
app.post('/todos', async (req, res) => {
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

// // Get all todos
// app.get('/todos', async (req, res) => {
//   try {
    
//     const todos = await prisma.todo.findMany();
//     res.json(todos);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get all todos or filter based on status
// app.get('/todos', async (req, res) => {
//   try {
//     const { status } = req.query;
//     let todos;
//     if (status) {
//       todos = await prisma.todo.findMany({
//         where: {
//           status: status.toLowerCase(), // Convert to lowercase for case-insensitive matching
//         },
//       });
//     } else {
//       todos = await prisma.todo.findMany();
//     }
//     res.json(todos);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

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
app.put('/todos/:id', async (req, res) => {
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

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Validation method to check if a string contains only alphabets and whitespaces
const isStringOnly = (str) => {
    return /^[A-Za-z\s]+$/.test(str);
};

// Validation method to check if status is valid
const isValidStatus = (status) => {
    const validStatuses = ['completed', 'in progress', 'pending'];
    return validStatuses.includes(status.toLowerCase());
};

// Validation method to check if priority is valid
const isValidPriority = (priority) => {
    const validPriorities = ['low', 'medium', 'high'];
    return validPriorities.includes(priority.toLowerCase());
};

// Validation middleware for creating a todo
const validateCreateTodo = (req, res, next) => {
    const { title, description, dueDateTime, priority, status } = req.body;

    // Check if title and description are strings, meet length requirements, and consist of only alphabets and whitespaces
    if (
        typeof title !== 'string' ||
        typeof description !== 'string' ||
        !isStringOnly(title) ||
        !isStringOnly(description) ||
        title.length < 4 ||
        description.length < 10
    ) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Title should be at least 4 characters long and contain only alphabets and whitespaces, and description should be at least 10 characters long and contain only alphabets and whitespaces'
        });
    }

    // Check if status is a string and is one of the valid statuses
    if (typeof status !== 'string' || !isValidStatus(status)) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Status must be one of: completed, in progress, pending'
        });
    }

    // Check if priority is a string and is one of the valid priorities
    if (typeof priority !== 'string' || !isValidPriority(priority)) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Priority must be one of: low, medium, high'
        });
    }

    // Check if dueDateTime is a valid date-time string with nanoseconds
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{9}$/.test(dueDateTime) || isNaN(Date.parse(dueDateTime))) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Due date and time must be a valid date-time string in the format YYYY-MM-DDTHH:MM:SS.SSSSSSSSS'
        });
    }

    // Check if the due date is in the future
    const currentDate = new Date();
    const parsedDueDateTime = new Date(dueDateTime);
    if (parsedDueDateTime <= currentDate) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Due date and time should be greater than the current date'
        });
    }

    // Call next middleware if all validations pass
    next();
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
        res.status(500).json({ timestamp: new Date().toISOString(), error: 'Server error' });
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
            return res.status(404).json({ timestamp: new Date().toISOString(), error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ timestamp: new Date().toISOString(), error: 'Server error' });
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
        res.status(500).json({ timestamp: new Date().toISOString(), error: 'Server error' });
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
            return res.status(404).json({ timestamp: new Date().toISOString(), error: 'Todo not found' });
        }

        const { title, description } = req.body;
        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                title: title || existingTodo.title,
                description: description || existingTodo.description,
                status: existingTodo.status,
                // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
                dueDate: existingTodo.dueDate,
                priority: existingTodo.priority,
            },
        });
        res.json(updatedTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ timestamp: new Date().toISOString(), error: 'Server error' });
    }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.todo.delete({ where: { id } });
        res.json({ timestamp: new Date().toISOString(), message: 'Todo deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ timestamp: new Date().toISOString(), error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Validation method to check if a string contains only alphabets, whitespaces, periods, underscores, and numeric characters
const isStringOnly = (str) => {
    return /^[A-Za-z0-9\s._]+$/.test(str);
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

    // Check if title is provided and is a string
    if (typeof title !== 'string') {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Title must be a string',
        });
        return;
    }

    // Check if title is a non-empty string
    if (title.trim().length === 0) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Title must be a non-empty string',
        });
        return;
    }

    // Check if title contains only allowed characters
    if (!isStringOnly(title)) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Title must contain only alphabets, whitespaces, periods, underscores, and numeric characters',
        });
        return;
    }

    // Check if title length meets the requirement
    if (title.length < 4) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Title should be at least 4 characters long',
        });
        return;
    }

    // Check if description is provided and is a string
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Description must be a non-empty string',
        });
        return;
    }

    // Check if description contains only allowed characters
    if (!isStringOnly(description)) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Description must contain only alphabets, whitespaces, periods, underscores, and numeric characters',
        });
        return;
    }

    // Check if description length meets the requirement
    if (description.length < 10) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Description should be at least 10 characters long',
        });
        return;
    }

    // Check if status is provided and is a valid status
    if (!status || typeof status !== 'string' || !isValidStatus(status)) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Status must be one of: completed, in progress, pending',
        });
        return;
    }

    // Check if priority is provided and is a valid priority
    if (!priority || typeof priority !== 'string' || !isValidPriority(priority)) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Priority must be one of: low, medium, high',
        });
        return;
    }

    // Check if dueDateTime is provided and is a valid date-time string with nanoseconds
    if (!dueDateTime || typeof dueDateTime !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dueDateTime) || isNaN(Date.parse(dueDateTime))) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Due date and time must be a valid date-time string in the format YYYY-MM-DDTHH:MM:SS',
        });
        return;
    }

    // Check if the due date is in the future
    const currentDate = new Date();
    const parsedDueDateTime = new Date(dueDateTime);
    if (parsedDueDateTime <= currentDate) {
        res.status(400).json({
            timestamp: new Date().toISOString(),
            error: 'Due date and time should be greater than the current date',
        });
        return;
    }

    // Call next middleware if all validations pass
    next();
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
    console.error(error);
    res.status(500).json({ timestamp: new Date().toISOString(), error: 'Server error' });
};

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/images'); // Specify the destination directory for file uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Define the filename for uploaded files
    },
});

const upload = multer({ storage: storage });

// Create a new todo with image upload
app.post('/todos', upload.single('image'), validateCreateTodo, async (req, res) => {
    try {
        const { title, description, dueDateTime, priority, status } = req.body;
        const imagePath = req.file.path;

        const newTodo = await prisma.todo.create({
            data: {
                title,
                description,
                dueDate: new Date(dueDateTime),
                priority,
                status,
                image: imagePath,
            },
        });

        res.json(newTodo);
    } catch (error) {
        errorHandler(error, req, res, null);
    }
});

// Get a single todo by ID
app.get('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const todo = await prisma.todo.findUnique({
            where: { id: parseInt(id) },
        });
        if (!todo) {
            res.status(404).json({ timestamp: new Date().toISOString(), error: 'Todo not found' });
            return;
        }
        res.json(todo);
    } catch (error) {
        errorHandler(error, req, res, null);
    }
});

// Get all todos or filter based on status and priority
app.get('/todos', async (req, res) => {
    const { status, priority } = req.query;
    try {
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
        errorHandler(error, req, res, null);
    }
});

// Update a todo
app.put('/todos/:id', validateCreateTodo, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const existingTodo = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existingTodo) {
            res.status(404).json({ timestamp: new Date().toISOString(), error: 'Todo not found' });
            return;
        }

        const { title, description, dueDateTime } = req.body;
        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                title: title || existingTodo.title,
                description: description || existingTodo.description,
                status: existingTodo.status,
                dueDate: new Date(dueDateTime),
                priority: existingTodo.priority,
            },
        });
        res.json(updatedTodo);
    } catch (error) {
        errorHandler(error, req, res, null);
    }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.todo.delete({ where: { id } });
        res.json({ timestamp: new Date().toISOString(), message: 'Todo deleted successfully' });
    } catch (error) {
        errorHandler(error, req, res, null);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

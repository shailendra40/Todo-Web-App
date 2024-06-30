// app.js

const express = require('express');
const todoRouter = require('./todoRouter');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use todoRouter for all todo-related routes
app.use('/todos', todoRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

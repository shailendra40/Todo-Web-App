'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // No associations for now
    }
  };
  Todo.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    createdAt: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    priority: DataTypes.ENUM('low', 'medium', 'high')
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};

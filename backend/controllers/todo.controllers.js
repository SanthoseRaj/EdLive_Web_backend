import * as todo from "../models/todo.model.js";

export const getAllTodos = async (req, res) => {
    try {
      const todos = await todo.getAllTodosByUser(req.user.id,req.user.usertype);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getTodoById = async (req, res) => {
    try {
      const todos = await todo.getTodoById(req.params.id, req.user.id);
      if (!todos) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const createTodo = async (req, res) => {
    try {
      const { date, title, description, classid, subjectid } = req.body;
      const todofileupload = req.file ? `/content/uploads/homework/${req.file.filename}` : null;
      const newTodo = await todo.createTodo(req.user.id, { date, title, description, classid, subjectid, todofileupload });
      res.status(201).json(newTodo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  export const updateTodo = async (req, res) => {
    try {
      const { date, title, description, completed,classid,subjectid } = req.body;
      const updatedTodo = await todo.updateTodo(
  req.params.id,
  req.user.id,
  req.user.usertype,   // 🔥 Pass userType
  { date, title, description, completed, classid, subjectid }
);
      
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(updatedTodo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  export const deleteTodo = async (req, res) => {
    try {
      await todo.deleteTodo(req.params.id, req.user.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  export const getAllTodosByStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const todos = await todo.getAllTodosByStudent(id);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
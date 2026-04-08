import pool from "../db/connectDB-pg.js";

const getAllTodosByUser = async (userId, userType) => {
  let query;
  if (userType == "Teacher") {
     query = 'SELECT * FROM todos WHERE user_id = $1 ORDER BY date DESC';
  }
  if (userType == "Student") {
     query = 'SELECT * FROM todos where class_id in (select class_id from students where id=$1) ORDER BY date DESC';
  }
  if (userType == "Staff Admin") {
     query = 'SELECT * FROM todos where $1=$1 ORDER BY date DESC';
  }

  const { rows } = await pool.query(query, [userId]);


    return rows;
};
  const getAllTodosByStudent = async (userId) => {
    const { rows } = await pool.query('SELECT * FROM todos where class_id in (select class_id from students where id=$1) ORDER BY date DESC', [userId]);
    return rows;
  };
  
  const getTodoById = async (id, userId) => {
    const { rows } = await pool.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0];
  };
  
  const createTodo = async (userId, { date, title, description,classid=null,subjectid=null,todofileupload=null }) => {
    const { rows } = await pool.query(
      'INSERT INTO todos (user_id, date, title, description,class_id,subject_id,todo_file) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING *',
      [userId, date, title, description,classid,subjectid,todofileupload]
    );
    return rows[0];
  };
  
  const updateTodo = async (id, userId, { date, title, description, completed,classid=null,subjectid=null,todofileupload=null }) => {
    const { rows } = await pool.query(
      `UPDATE todos 
       SET date = $1, title = $2, description = $3, completed = $4,class_id=$7,subject_id=$8,todo_file=$9, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [date, title, description, completed, id, userId,classid,subjectid,todofileupload]
    );
    return rows[0];
  };
  
  const deleteTodo = async (id, userId) => {
    await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
  };
  
  export  {
    getAllTodosByUser,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    getAllTodosByStudent,
  };
require("dotenv").config();
const express = require("express");
const app = express();
const pg = require("pg");
const PORT = 3000;
const client = new pg.Client(process.env.DB_URL);
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(require("morgan")("dev"));

app.listen(PORT, () => {
  console.log(`I am listening on port number ${PORT}`);
});

app.get("/", (req, res, next) => {
  res.send("Does this work?");
});

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
          SELECT * FROM employees
      `;
    const response = await client.query(SQL);
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `
          SELECT * FROM departments
      `;
    const response = await client.query(SQL);
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.post("/api/employees", async (req, res, next) => {
  try {
    const { name, department } = req.body;
    const SQL = `
          INSERT INTO employees(name, departments_id) VALUES($1, (SELECT id from departments where name =$2)) RETURNING *
      `;
    const response = await client.query(SQL, [name, department]);
    res.status(201).send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const SQL = `
          DELETE FROM employees WHERE id = $1
      `;
    await client.query(SQL, [id]);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.put("/api/employees/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department } = req.body;
    const SQL = `
              UPDATE employees
              SET departments_id=(SELECT id from departments where name =$1), updated_at= now()
              WHERE id=$2 
              RETURNING *
          `;
    const response = await client.query(SQL, [department, id]);
    res.status(200).json(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
};

init();

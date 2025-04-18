require("dotenv").config();
const express = require("express");
const app = express();
const pg = require("pg");
const cors = require("cors");
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(require("morgan")("dev"));
const client = new pg.Client("postgres://localhost/acme_hr_db");

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
    next(error);
  }
});

app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
          SELECT id from flavors
      `;
    const response = await client.query(SQL);
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.post("/api/flavors", async (req, res, next) => {
  try {
    const { name, is_favorite } = req.body;
    const SQL = `
          INSERT INTO flavors(name, is_favorite) VALUES($1, $2) RETURNING *
      `;
    const response = await client.query(SQL, [name, is_favorite]);
    res.status(201).send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const SQL = `
          DELETE FROM flavors WHERE id = $1
      `;
    await client.query(SQL, [id]);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_favorite } = req.body;
    const SQL = `
              UPDATE flavors
              SET is_favorite=$1, updated_at= now()
              WHERE id=$2 
              RETURNING *
          `;
    const response = await client.query(SQL, [is_favorite, id]);
    res.status(200).json(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
};

init();

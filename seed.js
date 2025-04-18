require("dotenv").config();
const express = require("express");
const app = express();
const pg = require("pg");
const cors = require("cors");
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(require("morgan")("dev"));
const client = new pg.Client(process.env.DB_URL);

const init = async (req, res, next) => {
  try {
    await client.connect();
    const SQL = `
            DROP TABLE IF EXISTS departments CASCADE;
            CREATE TABLE departments(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100),
                id UUID REFERENCES departments(id) NOT NULL
            );
            INSERT INTO departments(name) VALUES('HR');
            INSERT INTO departments(name) VALUES('Sales');
            INSERT INTO departments(name) VALUES('Marketing');
            INSERT INTO departments(name) VALUES('International operations');
            DROP TABLE IF EXISTS employees CASCADE;
            CREATE TABLE employees(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now(),
                // departments_id UUID REFERENCES employees(id) NOT NULL
            );
            INSERT INTO employees(name, departments_id) VALUES('Brian', (SELECT id from departments where name ='HR'));
            INSERT INTO employees(name, departments_id) VALUES('Lisa',  (SELECT id from departments where name ='Marketing'));
            INSERT INTO employees(name, departments_id) VALUES('Greg',  (SELECT id from departments where name ='Sales'));
            INSERT INTO employees(name, departments_id) VALUES('Paula', (SELECT id from departments where name ='International operations'));
            `;
    await client.query(SQL);
    await client.end();
    console.log("DB is seeded");
  } catch (error) {
    console.error(error);
  }
};

init();

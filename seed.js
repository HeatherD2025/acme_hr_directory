require("dotenv").config();
const express=require("express");
const app=express();
const pg=require("pg");
const PORT=3000;
const client=new pg.Client('postgres://localhost/acme_hr_db');
app.use(cors());
app.use(express.json());
app.use(require("morgan")("dev"));

const init=async (req, res, next) => {
    try {
        await client.connect();
        const SQL= `
            DROP TABLE IF EXISTS departments CASCADE;
            CREATE TABLE departments(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100)
            );
            INSERT INTO departments(name) VALUES ('HR');
            INSERT INTO departments(name) VALUES ('Sales');
            INSERT INTO departments(name) VALUES ('Marketing');
            INSERT INTO departments(name) VALUES ('International operations');
            DROP TABLE IF EXISTS employees;
            CREATE TABLE employees(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100),
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
            departments_id UUID REFERENCES departments(id) NOT NULL
            );
            INSERT INTO employees(name, departments_id) VALUES ('Brian', '8f5fbdf2-6d4d-44da-981a-98779f0d1543');
            INSERT INTO employees(name, departments_id) VALUES ('Lisa', 'ab750fdf-f58d-429a-b4e7-6ea460f8837e');
            INSERT INTO employees(name, departments_id) VALUES ('Greg', 'd74aa741-c402-4369-9d1e-64e5877d308e');
            INSERT INTO employees(name, departments_id) VALUES ('Paula', 'a2b20b3a-34a0-4f9f-912c-d750c8c3932d')
            `;
        await client.query(SQL);
        await client.end();
        console.log("DB is seeded");
    } catch (error) {
        console.error(error) 
    }
};

init();
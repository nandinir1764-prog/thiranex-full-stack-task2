const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// MySQL connection
// =========================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.connect((err) => {

    if (err) {

        console.error(
            "MySQL connection failed:",
            err.message
        );

    } else {

        console.log(
            "MySQL connected successfully! 🚀"
        );

    }

});


// =========================
// Test route
// =========================

app.get("/", (req, res) => {

    res.send(
        "Task Management API is running 🚀"
    );

});


// =========================
// Register
// =========================

app.post("/register", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    const sql = `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                console.error(
                    "Error registering user:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to register user"
                });

            }


            res.status(201).json({

                message:
                    "User registered successfully",

                userId:
                    result.insertId

            });

        }
    );

});


// =========================
// Login
// =========================

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        AND password = ?
    `;


    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.error(
                    "Error logging in:",
                    err
                );

                return res.status(500).json({
                    error: "Login failed"
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    error:
                        "Invalid email or password"
                });

            }


            res.json({

                message:
                    "Login successful",

                user: {

                    id: results[0].id,

                    name:
                        results[0].name,

                    email:
                        results[0].email

                }

            });

        }
    );

});


// =========================
// Create task
// =========================

app.post("/tasks", (req, res) => {

    const {
        user_id,
        title,
        description
    } = req.body;


    if (!user_id) {

        return res.status(400).json({
            error: "User ID is required"
        });

    }


    const sql = `
        INSERT INTO tasks
        (user_id, title, description)
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [user_id, title, description],
        (err, result) => {

            if (err) {

                console.error(
                    "Error creating task:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to create task"
                });

            }


            res.status(201).json({

                message:
                    "Task created successfully",

                taskId:
                    result.insertId

            });

        }
    );

});


// =========================
// Get tasks for user
// =========================

app.get("/tasks", (req, res) => {

    const user_id =
        req.query.user_id;


    if (!user_id) {

        return res.status(400).json({
            error: "User ID is required"
        });

    }


    const sql = `
        SELECT *
        FROM tasks
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;


    db.query(
        sql,
        [user_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching tasks:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to fetch tasks"
                });

            }


            res.json(results);

        }
    );

});


// =========================
// Update task
// =========================

app.put("/tasks/:id", (req, res) => {

    const {
        id
    } = req.params;


    const {
        user_id,
        title,
        description,
        status
    } = req.body;


    if (!user_id) {

        return res.status(400).json({
            error: "User ID is required"
        });

    }


    const sql = `
        UPDATE tasks
        SET title = ?,
            description = ?,
            status = ?
        WHERE id = ?
        AND user_id = ?
    `;


    db.query(
        sql,
        [
            title,
            description,
            status,
            id,
            user_id
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Error updating task:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to update task"
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error:
                        "Task not found or unauthorized"
                });

            }


            res.json({

                message:
                    "Task updated successfully"

            });

        }
    );

});


// =========================
// Delete task
// =========================

app.delete("/tasks/:id", (req, res) => {

    const {
        id
    } = req.params;


    const user_id =
        req.query.user_id;


    if (!user_id) {

        return res.status(400).json({
            error: "User ID is required"
        });

    }


    const sql = `
        DELETE FROM tasks
        WHERE id = ?
        AND user_id = ?
    `;


    db.query(
        sql,
        [id, user_id],
        (err, result) => {

            if (err) {

                console.error(
                    "Error deleting task:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Failed to delete task"
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error:
                        "Task not found or unauthorized"
                });

            }


            res.json({

                message:
                    "Task deleted successfully"

            });

        }
    );

});


// =========================
// Start server
// =========================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
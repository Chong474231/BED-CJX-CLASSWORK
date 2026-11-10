require('dotenv').config();
const sql = require('mssql');

const express = require('express');
const app = express();
// SQL Server connection settings
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};
// Route 1: Homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Book Category API');
});

// Route 2: Categories
app.get('/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Biography' }
  ]);
});

// Route 3: About
app.get('/about', (req, res) => {
  res.send('I am a Year 1 IT student at Ngee Ann Polytechnic. I am learning Node.js and Express.');
});

// Start server
app.listen(3000, () => {
  console.log('Listening on port 3000');
});

require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const app = express();

app.use(express.json());

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

// Homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Book Category API');
});

// Categories
app.get('/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Biography' }
  ]);
});

// About
app.get('/about', (req, res) => {
  res.send('I am a Year 1 IT student at Ngee Ann Polytechnic.');
});

// Get all authors
app.get('/authors', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query('SELECT * FROM Author');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get author by ID
app.get('/authors/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Author WHERE AuthorID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// Create a new author
app.post('/authors', async (req, res) => {
  const { id, name } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .query(`
        INSERT INTO Author (AuthorID, Name)
        OUTPUT INSERTED.*
        VALUES (@id, @name)
      `);

    res.status(201).json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// Update an author
app.put('/authors/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid author id' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .query(`
        UPDATE Author
        SET Name = @name
        OUTPUT INSERTED.*
        WHERE AuthorID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// Get all publishers
app.get('/publishers', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query('SELECT * FROM Publisher');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete an author
app.delete('/authors/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid author id' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Author WHERE AuthorID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(204).send();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get publisher by ID
app.get('/publishers/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Publisher WHERE PublisherID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create publisher
app.post('/publishers', async (req, res) => {
  const { PublisherID, Name } = req.body || {};

  // Validate the input
  if (!Number.isInteger(PublisherID) || PublisherID <= 0 ||
      typeof Name !== 'string' || !Name.trim()) {
    return res.status(400).json({
      error: 'Valid PublisherID and Name are required'
    });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('id', sql.Int, PublisherID)
      .input('name', sql.NVarChar, Name.trim())
      .query(`
        INSERT INTO Publisher (PublisherID, Name)
        OUTPUT INSERTED.PublisherID, INSERTED.Name
        VALUES (@id, @name)
      `);

    res.status(201).json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update publisher
app.put('/publishers/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { Name } = req.body || {};

  if (!Number.isInteger(id) || id <= 0 ||
      typeof Name !== 'string' || !Name.trim()) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, Name.trim())
      .query(`
        UPDATE Publisher
        SET Name = @name
        OUTPUT INSERTED.PublisherID, INSERTED.Name
        WHERE PublisherID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete publisher
app.delete('/publishers/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Publisher WHERE PublisherID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// Lab 6 - GET all books
app.get('/books', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request().query(
            'SELECT ISBN, Title, YearPublish, PublisherID, BookCat FROM Book'
        );

        res.status(200).json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});
// GET one book by ISBN
app.get('/books/:isbn', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const request = connection.request();

        request.input('isbn', sql.Char(10), req.params.isbn);

        const result = await request.query(
            'SELECT ISBN, Title, YearPublish, PublisherID, BookCat FROM Book WHERE ISBN = @isbn'
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        res.status(200).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});
// Lab 6 - Create a book with its author
app.post('/books', async (req, res) => {
    const {
        isbn, title, yearPublish,
        publisherId, bookCat, authorId
    } = req.body;

    let connection;
    let transaction;

    try {
        connection = await sql.connect(dbConfig);

        transaction = new sql.Transaction(connection);
        await transaction.begin();

        // Insert the book
        const book = transaction.request();

        book.input('isbn', sql.Char(10), isbn);
        book.input('title', sql.VarChar(200), title);
        book.input('yearPublish', sql.Char(4), yearPublish);
        book.input('publisherId', sql.SmallInt, publisherId);
        book.input('bookCat', sql.Char(2), bookCat);

        const result = await book.query(`
            INSERT INTO Book
            (ISBN, Title, YearPublish, PublisherID, BookCat)
            OUTPUT INSERTED.*
            VALUES
            (@isbn, @title, @yearPublish, @publisherId, @bookCat)
        `);

        // Insert the book-author relationship
        const author = transaction.request();

        author.input('isbn', sql.Char(10), isbn);
        author.input('authorId', sql.SmallInt, authorId);

        await author.query(`
            INSERT INTO BookAuthor (ISBN, AuthorID)
            VALUES (@isbn, @authorId)
        `);

        // Save both operations
        await transaction.commit();

        res.status(201).json(result.recordset[0]);

    } catch (err) {
        console.error(err);

        // Undo changes if an operation fails
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error(rollbackErr);
            }
        }

        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});
// Lab 7 - GET a specific book copy
app.get('/books/:isbn/copies/:copyNo', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const request = connection.request();

        request.input('isbn', sql.Char(10), req.params.isbn);
        request.input('copyNo', sql.TinyInt, req.params.copyNo);

        const result = await request.query(`
            SELECT ISBN, CopyNo, RentalRate, Status
            FROM BookCopy
            WHERE ISBN = @isbn AND CopyNo = @copyNo
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        res.status(200).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});
// Lab 7 - Update a book copy's rental rate
app.put('/books/:isbn/copies/:copyNo', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();

        // Identify the specific book copy
        request.input('isbn', sql.Char(10), req.params.isbn);
        request.input('copyNo', sql.TinyInt, req.params.copyNo);

        // Retrieve the new rental rate from the request body
        request.input('rentalRate', sql.SmallMoney, req.body.rentalRate);

        const result = await request.query(`
            UPDATE BookCopy
            SET RentalRate = @rentalRate
            OUTPUT INSERTED.*
            WHERE ISBN = @isbn AND CopyNo = @copyNo
        `);

        // Check whether the book copy exists
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Return the updated record
        res.status(200).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (connection) await connection.close();
    }
});
// Lab 7 - Delete a specific book copy
app.delete('/books/:isbn/copies/:copyNo', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();

        // Identify the specific book copy
        request.input('isbn', sql.Char(10), req.params.isbn);
        request.input('copyNo', sql.TinyInt, req.params.copyNo);

        const result = await request.query(`
            DELETE FROM BookCopy
            WHERE ISBN = @isbn AND CopyNo = @copyNo
        `);

        // Check whether the record exists
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Successfully deleted
        res.status(204).send();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (connection) await connection.close();
    }
});
// Lab 8 - Check whether a book copy is available
async function checkAvailable(isbn, copyNo) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input('isbn', sql.Char(10), isbn)
            .input('copyNo', sql.TinyInt, copyNo)
            .query('SELECT Status FROM BookCopy WHERE ISBN = @isbn AND CopyNo = @copyNo');

        if (result.recordset.length === 0) return null;

        return result.recordset[0].Status === 'D';

    } finally {
        if (connection) await connection.close();
    }
}
// Lab 8 - Mark a book copy as rented
async function markRented(isbn, copyNo) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        await connection.request()
            .input('isbn', sql.Char(10), isbn)
            .input('copyNo', sql.TinyInt, copyNo)
            .query("UPDATE BookCopy SET Status = 'M' WHERE ISBN = @isbn AND CopyNo = @copyNo");

    } finally {
        if (connection) await connection.close();
    }
}
// Lab 8 - Rent a book copy
app.put('/books/:isbn/copies/:copyNo/rent', async (req, res) => {
    const isbn = req.params.isbn;
    const copyNo = parseInt(req.params.copyNo);

    try {
        const available = await checkAvailable(isbn, copyNo);

        if (available === null)
            return res.status(404).json({ error: 'Not found' });

        if (available === false)
            return res.status(409).json({ error: 'Copy is already rented' });

        await markRented(isbn, copyNo);

        res.status(200).json({ ISBN: isbn, copyNo: copyNo, Status: 'M' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Start server
app.listen(3000, () => {
  console.log('Listening on port 3000');
});

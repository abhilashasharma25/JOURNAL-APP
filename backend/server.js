import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2/promise';
import Sentiment from 'sentiment';
const app = express();
const port = 5000;
//  MySQL database connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Heena1234@51',
    database: 'journal_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
const sentiment = new Sentiment();
app.use(cors());
app.use(bodyParser.json());
// Create a new journal entry
app.post('/entries', async (req, res) => {
    const { content } = req.body;
    const analysis = sentiment.analyze(content);
    const sentimentResult = analysis.score > 0 ? 'Positive' : analysis.score < 0 ? 'Negative' : 'Neutral';
    try {
        const [result] = await pool.query(
            'INSERT INTO journal_entries (content, sentiment) VALUES (?, ?)',
            [content, sentimentResult]
        );
        const insertedId = result.insertId;
        const [entry] = await pool.query('SELECT * FROM journal_entries WHERE id = ?', [insertedId]);
        res.status(201).json(entry[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/entries', async (req, res) => {
    try {

        const [entries] = await pool.query('SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at FROM journal_entries ORDER BY created_at DESC');

        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.put('/entries/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const analysis = sentiment.analyze(content);
    const sentimentResult = analysis.score > 0 ? 'Positive' : analysis.score < 0 ? 'Negative' : 'Neutral';

    try {
        await pool.query('UPDATE journal_entries SET content = ?, sentiment = ? WHERE id = ?', [
            content,
            sentimentResult,
            id,
        ]);
        const [updatedEntry] = await pool.query('SELECT * FROM journal_entries WHERE id = ?', [id]);
        res.json(updatedEntry[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.delete('/entries/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM journal_entries WHERE id = ?', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));



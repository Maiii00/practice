import express, { Express, Request, Response } from "express";
import { Pool } from "pg";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

type User = {
    id?: number;
    name: string;
    email: string;
};

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('Select * From users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
})

app.post('/users', async (req: Request, res: Response) => {
    const { name, email }: User = req.body;
    try {
        const result = await pool.query (
            'insert into users (name, email) values ($1, $2) returning *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.put('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email }: User = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
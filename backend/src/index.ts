import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { promptRouter } from './routes/prompt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/prompt', promptRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
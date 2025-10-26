import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { promptRouter } from './routes/prompt';
import { historyRouter } from './routes/history';
import { authRouter, configureGoogleStrategy } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(passport.initialize());
configureGoogleStrategy();

// Routes
app.use('/api/prompt', promptRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
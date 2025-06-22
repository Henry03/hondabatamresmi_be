import express from 'express';
import routes from './routes';
import { validateJson } from './middlewares/validateJson';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173'
}));


app.use(express.json());
app.use(validateJson);

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;

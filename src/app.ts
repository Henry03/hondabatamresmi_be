import express from 'express';
import routes from './routes';
import { validateJson } from './middlewares/validateJson';
import { errorHandler } from './middlewares/ErrorHandler';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173'
}));


app.use(express.json());
app.use(validateJson);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;

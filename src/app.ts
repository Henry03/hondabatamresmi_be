import express from 'express';
import routes from './routes';
import { validateJson } from './middlewares/validateJson';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:4000",
  "http://103.23.198.184:4000",
  "https://hondabatamresmi.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);


app.use(express.json());
app.use(validateJson);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;

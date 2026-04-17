import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import healthRouter from './routes/health.js';
import contactsRouter from './routes/contacts.js';
import resellersRouter from './routes/resellers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/resellers', resellersRouter);

app.get('/api', (_req, res) => {
  res.json({
    name: 'mensys-ecosystem-api',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/contacts', '/api/resellers'],
  });
});

app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Mensys API listening on :${PORT}`);
  });
}

export default app;

import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'mensys-ecosystem-api',
    timestamp: new Date().toISOString(),
  });
});

export default router;

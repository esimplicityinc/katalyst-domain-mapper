import { Elysia } from 'elysia';
import { governanceRoutes } from './routes/governance';

const app = new Elysia()
    .use(governanceRoutes)
    .get('/api/health', () => ({ status: 'ok' }))
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

// rotas autenticadas
routes.use(authMiddleware);
routes.get('/users', UserController.show);

export default routes;

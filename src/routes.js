import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StundentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
// sessions
routes.post('/sessions', SessionController.store);
// users
routes.get('/users', authMiddleware, UserController.show);
// students
routes.post('/students', authMiddleware, StudentController.store);
routes.get('/students', authMiddleware, StudentController.show);
routes.get('/students/:id', StudentController.index);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', authMiddleware, StudentController.delete);

export default routes;

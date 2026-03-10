import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import validate from '../validators/validate.js';
import { createSchema } from '../validators/user.validate.js';
import { authenticateToken } from '../middlewares/authenticate.middleware.js';

const router = Router();

router
    .route('/')
    .get(userController.get)
    .post(validate(createSchema), userController.create)

router.get('/list/pagination', userController.listPagination);
router.get('/:id/tasks', userController.findWithTasks);

router
    .route('/:id')
    .get(authenticateToken, userController.find)
    .put(authenticateToken, validate(createSchema), userController.update)
    .patch(authenticateToken, userController.activateInactivate)
    .delete(authenticateToken, userController.eliminar)
export default router
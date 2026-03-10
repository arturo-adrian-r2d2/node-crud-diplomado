import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.route.js'
import usersRoutes from './routes/users.route.js'
import tasksRoutes from './routes/tasks.route.js'
import {authenticateToken} from './middlewares/authenticate.middleware.js'

const app = express();

// Middlewares
app.use(morgan('combined'));
app.use(express.json())

// Routes
app.use('/api/login', authRoutes ) 
app.use('/api/users/', usersRoutes)
app.use('/api/tasks/', authenticateToken, tasksRoutes)


export default app;

import express from 'express';
import categoryRoutes from './modules/categories/category.routes';

export const app = express();

app.use(express.json());
app.use('/categories', categoryRoutes);

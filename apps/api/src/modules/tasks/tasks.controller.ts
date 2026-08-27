import { Request, Response, NextFunction } from 'express';
import { tasksService } from './tasks.service.js';
import { createTaskSchema, updateTaskSchema } from './tasks.types.js';

export class TasksController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const subjectId = req.query.subjectId as string | undefined;
      const isCompleted =
        req.query.isCompleted !== undefined
          ? req.query.isCompleted === 'true'
          : undefined;

      const tasks = await tasksService.listTasks(req.user!.id, { subjectId, isCompleted });
      res.status(200).json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTaskSchema.parse(req.body);
      const task = await tasksService.createTask(req.user!.id, validated);
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.toggleTask(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateTaskSchema.parse(req.body);
      const task = await tasksService.updateTask(req.user!.id, req.params.id, validated);
      res.status(200).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await tasksService.deleteTask(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Task deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const tasksController = new TasksController();

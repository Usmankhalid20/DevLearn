import { Request, Response, NextFunction } from 'express';
import { subjectsService } from './subjects.service.js';
import { createSubjectSchema, updateSubjectSchema } from './subjects.types.js';

export class SubjectsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const subjects = await subjectsService.listSubjects(req.user!.id);
      res.status(200).json({ success: true, data: subjects });
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const subject = await subjectsService.getSubject(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: subject });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSubjectSchema.parse(req.body);
      const subject = await subjectsService.createSubject(req.user!.id, validated);
      res.status(201).json({ success: true, data: subject });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateSubjectSchema.parse(req.body);
      const subject = await subjectsService.updateSubject(req.user!.id, req.params.id, validated);
      res.status(200).json({ success: true, data: subject });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await subjectsService.deleteSubject(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Subject deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const subjectsController = new SubjectsController();

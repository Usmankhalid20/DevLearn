import { Request, Response, NextFunction } from 'express';
import { coursesService } from './courses.service.js';
import { createCourseSchema, updateCourseSchema } from './courses.types.js';

export class CoursesController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await coursesService.listCourses(req.user!.id);
      res.status(200).json({ success: true, data: courses });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCourseSchema.parse(req.body);
      const course = await coursesService.createCourse(req.user!.id, validated);
      res.status(201).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateCourseSchema.parse(req.body);
      const course = await coursesService.updateCourse(req.user!.id, req.params.id, validated);
      res.status(200).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await coursesService.deleteCourse(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Course deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const coursesController = new CoursesController();

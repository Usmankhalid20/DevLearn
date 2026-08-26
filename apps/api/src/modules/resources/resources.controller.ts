import { Request, Response, NextFunction } from 'express';
import { resourcesService } from './resources.service.js';
import { createResourceSchema, updateResourceSchema } from './resources.types.js';

export class ResourcesController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await resourcesService.listResources(req.user!.id);
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createResourceSchema.parse(req.body);
      const resource = await resourcesService.createResource(req.user!.id, validated);
      res.status(201).json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateResourceSchema.parse(req.body);
      const resource = await resourcesService.updateResource(req.user!.id, req.params.id, validated);
      res.status(200).json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resourcesService.deleteResource(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Resource deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const resourcesController = new ResourcesController();

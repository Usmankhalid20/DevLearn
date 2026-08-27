import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import type { CreateResourceInput, UpdateResourceInput } from './resources.types.js';
import type { ResourceDto } from '@devlearn/types';

export class ResourcesService {
  private formatResource(res: {
    id: string;
    userId: string;
    title: string;
    url: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  }): ResourceDto {
    return {
      id: res.id,
      userId: res.userId,
      title: res.title,
      url: res.url,
      type: res.type,
      createdAt: res.createdAt.toISOString(),
      updatedAt: res.updatedAt.toISOString(),
    };
  }

  async listResources(userId: string): Promise<ResourceDto[]> {
    const list = await prisma.resource.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((r) => this.formatResource(r));
  }

  async createResource(userId: string, input: CreateResourceInput): Promise<ResourceDto> {
    const resource = await prisma.resource.create({
      data: {
        userId,
        title: input.title,
        url: input.url,
        type: input.type ?? 'url',
      },
    });
    return this.formatResource(resource);
  }

  async updateResource(
    userId: string,
    id: string,
    input: UpdateResourceInput
  ): Promise<ResourceDto> {
    const resource = await prisma.resource.findFirst({
      where: { id, userId },
    });

    if (!resource) {
      throw new AppError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        url: input.url ?? undefined,
        type: input.type ?? undefined,
      },
    });

    return this.formatResource(updated);
  }

  async deleteResource(userId: string, id: string): Promise<void> {
    const resource = await prisma.resource.findFirst({
      where: { id, userId },
    });

    if (!resource) {
      throw new AppError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
    }

    await prisma.resource.delete({ where: { id } });
  }
}

export const resourcesService = new ResourcesService();

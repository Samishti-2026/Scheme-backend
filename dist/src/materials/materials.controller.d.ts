import { MaterialsService } from './materials.service';
import { Material } from '../common/entities/material.entity';
export declare class MaterialsController {
    private readonly service;
    constructor(service: MaterialsService);
    findAll(): Promise<Material[]>;
    findOne(id: string): Promise<Material | null>;
    create(data: Partial<Material>): Promise<Material>;
}

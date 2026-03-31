import { DataSource } from 'typeorm';
import { Material } from '../common/entities/material.entity';
export declare class MaterialsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private get repository();
    findAll(): Promise<Material[]>;
    findOne(material: number): Promise<Material | null>;
    create(data: Partial<Material>): Promise<Material>;
}

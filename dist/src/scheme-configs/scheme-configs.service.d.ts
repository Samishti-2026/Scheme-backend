import { DataSource } from 'typeorm';
import { SchemeConfig } from './scheme-config.entity';
export declare class SchemeConfigsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private get repository();
    findAll(): Promise<SchemeConfig[]>;
    createConfig(name: string, config: any, actorName?: string): Promise<SchemeConfig>;
    upsertByName(name: string, config: any): Promise<SchemeConfig | null>;
    findByName(name: string): Promise<SchemeConfig | null>;
    create(data: Partial<SchemeConfig>): Promise<SchemeConfig>;
    findOne(id: number): Promise<SchemeConfig | null>;
    update(id: number, data: Partial<SchemeConfig>, actorName?: string): Promise<SchemeConfig | null>;
    remove(id: number): Promise<void>;
}

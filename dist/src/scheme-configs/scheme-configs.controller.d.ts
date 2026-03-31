import type { Request } from 'express';
import { SchemeConfigsService } from './scheme-configs.service';
import { SchemeConfig } from './scheme-config.entity';
export declare class SchemeConfigsController {
    private readonly schemeConfigsService;
    constructor(schemeConfigsService: SchemeConfigsService);
    findAll(name?: string): Promise<SchemeConfig | SchemeConfig[]>;
    findAllConfigs(): Promise<SchemeConfig[]>;
    create(body: {
        name?: string;
        config: any;
    }, req: Request): Promise<SchemeConfig>;
    update(id: string, data: Partial<SchemeConfig>, req: Request): Promise<SchemeConfig | null>;
    remove(id: string): Promise<void>;
}

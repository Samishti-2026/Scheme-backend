import { DataSource } from 'typeorm';
export declare class DatasetsController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getDatasets(): Promise<{
        database: string | Uint8Array<ArrayBufferLike> | undefined;
        datasets: {
            name: string;
            fields: {
                name: string;
                type: string;
            }[];
        }[];
    }>;
    getFilterValues(table: string, column: string): Promise<any[]>;
}

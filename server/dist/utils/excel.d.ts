export interface ImportError {
    baris: number;
    pesan: string;
}
export interface ImportResult {
    berhasil: number;
    gagal: number;
    errors: ImportError[];
}
export declare function readExcelFile(filePath: string): Promise<Record<string, unknown>[]>;
export declare function cleanupFile(filePath: string): void;
export declare function createInfrastrukturExcel(data: Record<string, unknown>[]): Promise<Buffer>;
export declare function createStatistikExcel(data: Record<string, unknown>[]): Promise<Buffer>;

import { ConfigService } from '@nestjs/config';
export declare class CryptoService {
    private readonly config;
    private readonly key;
    constructor(config: ConfigService);
    encrypt(plaintext: string): string;
    decrypt(ciphertext: string): string;
    isEncrypted(value: string): boolean;
}

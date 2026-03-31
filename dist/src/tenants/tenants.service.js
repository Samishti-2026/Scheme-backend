"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const crypto_service_1 = require("../common/crypto.service");
let TenantsService = class TenantsService {
    request;
    repository;
    crypto;
    constructor(request, repository, crypto) {
        this.request = request;
        this.repository = repository;
        this.crypto = crypto;
    }
    getTenantId() {
        const user = this.request.user;
        if (user?.tenantId != null)
            return String(user.tenantId);
        return 'default';
    }
    findAll() {
        return this.repository.find();
    }
    async create(data) {
        const tenant = this.repository.create({
            ...data,
            connectionUri: data.connectionUri ? this.crypto.encrypt(data.connectionUri) : data.connectionUri,
        });
        return this.repository.save(tenant);
    }
    findOne(id) {
        return this.repository.findOne({ where: { id } });
    }
    findBySlug(slug) {
        return this.repository.findOne({ where: { slug } });
    }
    decryptConnectionUri(encryptedDbName) {
        if (!encryptedDbName)
            return encryptedDbName;
        return this.crypto.isEncrypted(encryptedDbName)
            ? this.crypto.decrypt(encryptedDbName)
            : encryptedDbName;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        crypto_service_1.CryptoService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map
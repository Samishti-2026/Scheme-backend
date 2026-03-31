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
exports.SchemesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const scheme_entity_1 = require("./scheme.entity");
let SchemesService = class SchemesService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(scheme_entity_1.Scheme);
    }
    async findAll(filters = {}) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.region)
            where.region = filters.region;
        if (filters.type)
            where.targetType = filters.type;
        if (filters.search)
            where.name = (0, typeorm_1.ILike)(`%${filters.search}%`);
        return this.repository.find({ where, order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        return this.repository.findOne({ where: { id } });
    }
    async create(data) {
        const scheme = this.repository.create(data);
        return this.repository.save(scheme);
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repository.delete(id);
    }
};
exports.SchemesService = SchemesService;
exports.SchemesService = SchemesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SchemesService);
//# sourceMappingURL=schemes.service.js.map
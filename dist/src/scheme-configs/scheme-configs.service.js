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
exports.SchemeConfigsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const scheme_config_entity_1 = require("./scheme-config.entity");
let SchemeConfigsService = class SchemeConfigsService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(scheme_config_entity_1.SchemeConfig);
    }
    async findAll() {
        return this.repository.find();
    }
    async createConfig(name, config, actorName) {
        const existing = await this.repository.findOne({ where: { name } });
        if (existing)
            throw new common_1.ConflictException(`Config '${name}' already exists. Use PUT to update it.`);
        const record = this.repository.create({ name, config, createdBy: actorName, updatedBy: actorName });
        return this.repository.save(record);
    }
    async upsertByName(name, config) {
        const existing = await this.repository.findOne({ where: { name } });
        if (existing) {
            await this.repository.update(existing.id, { config });
            return this.repository.findOne({ where: { name } });
        }
        const record = this.repository.create({ name, config });
        return this.repository.save(record);
    }
    async findByName(name) {
        return this.repository.findOne({ where: { name } });
    }
    async create(data) {
        const config = this.repository.create(data);
        return this.repository.save(config);
    }
    async findOne(id) {
        return this.repository.findOne({ where: { id } });
    }
    async update(id, data, actorName) {
        await this.repository.update(id, { ...data, updatedBy: actorName });
        return this.findOne(id);
    }
    async remove(id) {
        await this.repository.delete(id);
    }
};
exports.SchemeConfigsService = SchemeConfigsService;
exports.SchemeConfigsService = SchemeConfigsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SchemeConfigsService);
//# sourceMappingURL=scheme-configs.service.js.map
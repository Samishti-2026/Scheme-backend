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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const payment_entity_1 = require("../common/entities/payment.entity");
let PaymentsService = class PaymentsService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get repository() {
        return this.dataSource.getRepository(payment_entity_1.Payment);
    }
    findAll() {
        return this.repository.find();
    }
    findOne(company_code, bill_doc, customer_number, accounting_document, item_num) {
        return this.repository.findOne({ where: { company_code, bill_doc, customer_number, accounting_document, item_num } });
    }
    create(data) {
        const payment = this.repository.create(data);
        return this.repository.save(payment);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TENANT_CONNECTION')),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
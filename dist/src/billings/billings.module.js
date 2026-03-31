"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const billings_controller_1 = require("./billings.controller");
const billings_service_1 = require("./billings.service");
const billing_entity_1 = require("../common/entities/billing.entity");
let BillingsModule = class BillingsModule {
};
exports.BillingsModule = BillingsModule;
exports.BillingsModule = BillingsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([billing_entity_1.Billing])],
        controllers: [billings_controller_1.BillingsController],
        providers: [billings_service_1.BillingsService],
        exports: [billings_service_1.BillingsService],
    })
], BillingsModule);
//# sourceMappingURL=billings.module.js.map
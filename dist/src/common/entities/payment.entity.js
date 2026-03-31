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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
let Payment = class Payment {
    company_code;
    bill_doc;
    customer_number;
    accounting_document;
    item_num;
    special_gl_indicator;
    clearing_date;
    clearing_document;
    assignment_number;
    fiscal_year;
    posting_date;
    document_date;
    entry_date;
    currency;
    local_currency;
    reference_document_number;
    document_type;
    fiscal_period;
    posting_key;
    debit_credit_indicator;
    business_area;
    tax_code;
    item_text;
    branch;
    baseline_date;
    terms_of_payment;
    amount;
    inv_ref;
    inv_year;
    inv_item;
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryColumn)('numeric'),
    __metadata("design:type", Number)
], Payment.prototype, "company_code", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('numeric'),
    __metadata("design:type", Number)
], Payment.prototype, "bill_doc", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('numeric'),
    __metadata("design:type", Number)
], Payment.prototype, "customer_number", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('numeric'),
    __metadata("design:type", Number)
], Payment.prototype, "accounting_document", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)('numeric'),
    __metadata("design:type", Number)
], Payment.prototype, "item_num", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "special_gl_indicator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "clearing_date", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "clearing_document", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "assignment_number", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "fiscal_year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "posting_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "document_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "entry_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "local_currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "reference_document_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "document_type", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "fiscal_period", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "posting_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "debit_credit_indicator", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "business_area", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "tax_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "item_text", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "baseline_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "terms_of_payment", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "inv_ref", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "inv_year", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "inv_item", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payment')
], Payment);
//# sourceMappingURL=payment.entity.js.map
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
exports.QueryController = void 0;
const common_1 = require("@nestjs/common");
const query_service_1 = require("./query.service");
const swagger_1 = require("@nestjs/swagger");
const operators_1 = require("./utils/operators");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const OPERATOR_LABELS = {
    eq: 'Equals (=)',
    ne: 'Not Equals (!=)',
    contains: 'Contains',
    gt: 'Greater Than (>)',
    lt: 'Less Than (<)',
    gte: 'Greater/Equal (≥)',
    lte: 'Less/Equal (≤)',
    in: 'In',
    between: 'Between',
    startsWith: 'Starts With',
    endsWith: 'Ends With',
};
let QueryController = class QueryController {
    queryService;
    constructor(queryService) {
        this.queryService = queryService;
    }
    execute(body) {
        const { filters = [], matchLogic = 'AND', aggregation = [], having = [], groupBy = [] } = body;
        return this.queryService.execute(filters, matchLogic, aggregation, having, groupBy);
    }
    getFieldValues(collection, field) {
        if (!collection || !field)
            throw new common_1.BadRequestException('collection and field are required');
        return this.queryService.getFieldValues(collection, field);
    }
    getOperators() {
        return Object.keys(operators_1.OPERATORS).map(key => ({
            key,
            label: OPERATOR_LABELS[key] ?? key,
        }));
    }
};
exports.QueryController = QueryController;
__decorate([
    (0, common_1.Post)('execute'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QueryController.prototype, "execute", null);
__decorate([
    (0, common_1.Get)('field-values'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    __param(0, (0, common_1.Query)('collection')),
    __param(1, (0, common_1.Query)('field')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QueryController.prototype, "getFieldValues", null);
__decorate([
    (0, common_1.Get)('operators'),
    (0, roles_decorator_1.Roles)('Admin', 'Executive', 'Manager', 'Participant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryController.prototype, "getOperators", null);
exports.QueryController = QueryController = __decorate([
    (0, swagger_1.ApiTags)('query'),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, common_1.Controller)('query'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [query_service_1.QueryService])
], QueryController);
//# sourceMappingURL=query.controller.js.map
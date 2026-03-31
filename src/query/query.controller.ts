import { Controller, Post, Get, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { QueryService, QueryFilter, AggregationOp, GroupByField, HavingFilter } from './query.service';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { OPERATORS } from './utils/operators';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

interface ExecuteQueryDto {
  filters?: QueryFilter[];
  matchLogic?: 'AND' | 'OR';
  aggregation?: AggregationOp[];
  having?: HavingFilter[];
  groupBy?: GroupByField[];
}

// Human-readable labels for each operator key
const OPERATOR_LABELS: Record<string, string> = {
  eq:         'Equals (=)',
  ne:         'Not Equals (!=)',
  contains:   'Contains',
  gt:         'Greater Than (>)',
  lt:         'Less Than (<)',
  gte:        'Greater/Equal (≥)',
  lte:        'Less/Equal (≤)',
  in:         'In',
  between:    'Between',
  startsWith: 'Starts With',
  endsWith:   'Ends With',
};

@ApiTags('query')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('query')
@UseGuards(RolesGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post('execute')
  @Roles('Admin', 'Executive', 'Manager')
  execute(@Body() body: ExecuteQueryDto) {
    const { filters = [], matchLogic = 'AND', aggregation = [], having = [], groupBy = [] } = body;
    return this.queryService.execute(filters, matchLogic, aggregation, having, groupBy);
  }

  @Get('field-values')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  getFieldValues(
    @Query('collection') collection: string,
    @Query('field') field: string,
  ) {
    if (!collection || !field) throw new BadRequestException('collection and field are required');
    return this.queryService.getFieldValues(collection, field);
  }

  @Get('operators')
  @Roles('Admin', 'Executive', 'Manager', 'Participant')
  getOperators() {
    return Object.keys(OPERATORS).map(key => ({
      key,
      label: OPERATOR_LABELS[key] ?? key,
    }));
  }
}

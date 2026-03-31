import { RELATIONS } from './relations';
import { findPath } from './path-resolver';
import { winstonInstance as logger } from '../../common/winston.logger';

const CTX = 'JoinPlanner';

interface JoinDef {
  type: string;
  table: string;
  condition: string;
}

function dedupe<T>(arr: T[], keyFn: (i: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter(i => {
    const k = keyFn(i);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function buildJoinPlan(root: string, filters: { collection: string }[]): JoinDef[] {
  const joins: JoinDef[] = [];
  const collections = [...new Set(filters.map(f => f.collection))];

  logger.debug(`buildJoinPlan root="${root}"`, { context: CTX, collections });

  for (const f of filters) {
    if (f.collection === root) {
      logger.debug(`  "${f.collection}" == root — no join needed`, { context: CTX });
      continue;
    }

    const path = findPath(root, f.collection);
    logger.debug(`  Path ${root} → ${f.collection}: ${path ? path.join(' → ') : 'NOT FOUND'}`, { context: CTX });

    if (!path) continue;

    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const rel = RELATIONS.find(r => (r.from === a && r.to === b) || (r.from === b && r.to === a));

      if (!rel) {
        logger.warn(`No relation between "${a}" and "${b}"`, { context: CTX });
        continue;
      }

      const leftCol  = rel.from === a ? rel.local   : rel.foreign;
      const rightCol = rel.from === a ? rel.foreign  : rel.local;
      const condition = `${a}.${leftCol} = ${b}.${rightCol}`;

      joins.push({ type: 'LEFT JOIN', table: b, condition });
      logger.debug(`  + LEFT JOIN ${b} ON ${condition}`, { context: CTX });
    }
  }

  const deduped = dedupe(joins, j => `${j.table}:${j.condition}`);
  logger.debug(`Final joins (${deduped.length}): ${deduped.map(j => j.table).join(', ') || '(none)'}`, { context: CTX });
  return deduped;
}

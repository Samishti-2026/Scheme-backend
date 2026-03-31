import { RELATIONS } from './relations';

export function findPath(start: string, target: string): string[] | null {
  if (start === target) return [start];
  const queue: string[][] = [[start]];
  const visited = new Set([start]);

  while (queue.length) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    for (const r of RELATIONS) {
      const next = r.from === node ? r.to : r.to === node ? r.from : null;
      if (!next || visited.has(next)) continue;
      if (next === target) return [...path, next];
      visited.add(next);
      queue.push([...path, next]);
    }
  }
  return null;
}

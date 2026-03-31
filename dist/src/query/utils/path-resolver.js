"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPath = findPath;
const relations_1 = require("./relations");
function findPath(start, target) {
    if (start === target)
        return [start];
    const queue = [[start]];
    const visited = new Set([start]);
    while (queue.length) {
        const path = queue.shift();
        const node = path[path.length - 1];
        for (const r of relations_1.RELATIONS) {
            const next = r.from === node ? r.to : r.to === node ? r.from : null;
            if (!next || visited.has(next))
                continue;
            if (next === target)
                return [...path, next];
            visited.add(next);
            queue.push([...path, next]);
        }
    }
    return null;
}
//# sourceMappingURL=path-resolver.js.map
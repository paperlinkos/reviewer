import { describe, expect, it } from 'vitest';
import { annotationGeometryV1Schema } from './index.js';
describe('annotation geometry v1', () => { it('accepts a point', () => expect(annotationGeometryV1Schema.parse({ version: 'v1', kind: 'point', x: 12, y: 34 })).toMatchObject({ kind: 'point' })); });

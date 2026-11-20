import { describe, it, expect } from 'vitest';
import { createProjectSchema } from '@/components/projects/CreateProjectModal';
import { createSprintSchema } from '@/components/sprints/CreateSprintModal';
import { cn } from '@/lib/utils';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import fs from 'node:fs';
import path from 'node:path';

describe('Task 7: Complete Frontend Stack Verification', () => {
  describe('React Hook Form + Zod Validation', () => {
    it('validates project input schema successfully', () => {
      const valid = {
        name: 'Wrkld Mobile App',
        slug: 'wrkld-mobile-app',
        targetDate: '2026-12-31',
        status: 'active' as const,
        projectLeadIndex: 0,
        description: 'Mobile client for Wrkld platform',
      };
      const result = createProjectSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects short project name in schema', () => {
      const invalid = {
        name: 'AB',
        slug: 'ab-project',
        targetDate: '2026-12-31',
        status: 'planning' as const,
        projectLeadIndex: 0,
      };
      const result = createProjectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(true);
      }
    });

    it('rejects invalid project slug containing uppercase or symbols', () => {
      const invalid = {
        name: 'Valid Project Name',
        slug: 'Invalid_Slug!',
        targetDate: '2026-12-31',
        status: 'planning' as const,
        projectLeadIndex: 0,
      };
      const result = createProjectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('slug'))).toBe(true);
      }
    });

    it('validates sprint schema and enforces endDate > startDate', () => {
      const valid = {
        name: 'Sprint 5 — Polish & Launch',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        status: 'planning' as const,
        goal: 'Complete milestone 5',
      };
      const result = createSprintSchema.safeParse(valid);
      expect(result.success).toBe(true);

      const invalidDate = {
        name: 'Sprint 5 — Polish & Launch',
        startDate: '2026-10-15',
        endDate: '2026-10-01',
        status: 'planning' as const,
      };
      const invalidResult = createSprintSchema.safeParse(invalidDate);
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error.issues.some((i) => i.path.includes('endDate'))).toBe(true);
      }
    });
  });

  describe('@dnd-kit/sortable Integration', () => {
    it('exports SortableContext and verticalListSortingStrategy properly', () => {
      expect(typeof SortableContext).toBe('function');
      expect(typeof verticalListSortingStrategy).toBe('function');
    });
  });

  describe('shadcn/ui Utilities & Configuration', () => {
    it('merges tailwind classes using cn utility with conflict resolution', () => {
      const merged = cn('px-2 py-1 bg-red-500', 'px-4 bg-blue-500');
      expect(merged).toContain('px-4');
      expect(merged).toContain('bg-blue-500');
      expect(merged).not.toContain('px-2');
      expect(merged).not.toContain('bg-red-500');
    });

    it('verifies components.json configuration exists and specifies correct aliases', () => {
      const configPath = path.resolve(process.cwd(), 'components.json');
      expect(fs.existsSync(configPath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      expect(content.aliases).toBeDefined();
      expect(content.aliases.utils).toBe('@/lib/utils');
      expect(content.aliases.ui).toBe('@/components/ui');
    });
  });
});

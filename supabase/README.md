# Supabase Schema Workflow

This repo now tracks the linked Supabase public schema in `supabase/migrations`.

## Current Project

- Supabase project: `mwpscytkzjtkqjjqytqu`
- Project name: `Sir Leo Site`
- Baseline migration: `migrations/20260506000000_baseline_public_schema.sql`

## Branch Strategy

- `main` should point at the production Supabase project.
- `dev` should either point at a separate Supabase dev project/branch, or stay compatible with production until a separate dev database exists.
- Preview branches should use Supabase branching or a separate preview project when schema changes are being tested.

## Migration Rules

- Do not change tables only in the Supabase dashboard without adding a migration.
- Add one migration per schema change with `supabase migration new <name>`.
- Keep migrations schema-only unless a data migration is explicitly required.
- Avoid removing compatibility columns until all deployed branches no longer use them.

## Compatibility Note

The current remote `submissions` table has both follow-up columns:

- `follow_up_sent boolean default false`
- `sequence_step integer default 0`

That means the older main-based branch can still run its single follow-up logic while newer `dev` can run the multi-step sequence logic.

-- Draft PostgreSQL schema, NOT an applied/production migration.
-- The trusted application supplies app.family_id within every transaction.
-- Never expose a DB credential to a browser. Review role ownership / BYPASSRLS.
BEGIN;
CREATE TABLE families (
 id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE children (
 id uuid PRIMARY KEY, family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
 age_band text NOT NULL CHECK (age_band IN ('5–6','7–9','10–12')),
 declared_profile jsonb NOT NULL DEFAULT '{}', profile_version bigint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(family_id,id)
);
CREATE TABLE projects (
 id uuid PRIMARY KEY, family_id uuid NOT NULL, child_id uuid NOT NULL,
 kind text NOT NULL, version bigint NOT NULL DEFAULT 1,
 state jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(family_id,child_id) REFERENCES children(family_id,id) ON DELETE CASCADE,
 UNIQUE(family_id,child_id,id)
);
CREATE TABLE learning_events (
 id uuid PRIMARY KEY, family_id uuid NOT NULL, child_id uuid NOT NULL, project_id uuid NOT NULL,
 event_key text NOT NULL, skill_id text NOT NULL, task_id text NOT NULL, context_key text NOT NULL,
 outcome text NOT NULL CHECK(outcome IN ('independent','supported','retry','observation','uncertain')),
 attempt integer NOT NULL CHECK(attempt BETWEEN 1 AND 100), hint_used boolean NOT NULL,
 rubric_version text NOT NULL, observed_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL, retracted_at timestamptz,
 FOREIGN KEY(family_id,child_id,project_id) REFERENCES projects(family_id,child_id,id) ON DELETE CASCADE,
 UNIQUE(family_id,child_id,event_key), CHECK(expires_at>observed_at)
);
CREATE INDEX learning_events_context ON learning_events(family_id,child_id,skill_id,observed_at DESC);
CREATE TABLE consents (
 id uuid PRIMARY KEY, family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
 purpose text NOT NULL, policy_version text NOT NULL, granted_at timestamptz NOT NULL,
 revoked_at timestamptz, guardian_auth_subject text NOT NULL
);
-- Source evidence tables own truth; skill estimates/cache are rebuildable.
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE children FORCE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events FORCE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents FORCE ROW LEVEL SECURITY;
CREATE POLICY children_scope ON children USING(family_id::text=current_setting('app.family_id',true)) WITH CHECK(family_id::text=current_setting('app.family_id',true));
CREATE POLICY projects_scope ON projects USING(family_id::text=current_setting('app.family_id',true)) WITH CHECK(family_id::text=current_setting('app.family_id',true));
CREATE POLICY evidence_scope ON learning_events USING(family_id::text=current_setting('app.family_id',true)) WITH CHECK(family_id::text=current_setting('app.family_id',true));
CREATE POLICY consent_scope ON consents USING(family_id::text=current_setting('app.family_id',true)) WITH CHECK(family_id::text=current_setting('app.family_id',true));
COMMIT;

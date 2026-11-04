-- PACTFLOW Row Level Security (RLS) Policies
-- Enforces zero-trust data access and prevents unauthorized mutations

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 2. Projects
CREATE POLICY "Projects viewable by owner or members"
ON projects FOR SELECT
TO authenticated
USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = projects.id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "Clients can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (client_id = auth.uid());

-- 3. Project Members
CREATE POLICY "Members viewable by project participants"
ON project_members FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_members.project_id
        AND projects.client_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM project_members pm2
        WHERE pm2.project_id = project_members.project_id
        AND pm2.user_id = auth.uid()
    )
);

CREATE POLICY "Clients can manage project members"
ON project_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_members.project_id
        AND projects.client_id = auth.uid()
    )
);

-- 4. Agreements
CREATE POLICY "Agreements viewable by project participants"
ON agreements FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = agreements.project_id
        AND project_members.user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = agreements.project_id
        AND projects.client_id = auth.uid()
    )
);

-- 5. Agreement Acceptances
CREATE POLICY "Acceptances viewable by project participants"
ON agreement_acceptances FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM agreements a
        JOIN project_members pm ON pm.project_id = a.project_id
        WHERE a.id = agreement_acceptances.agreement_id
        AND pm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own acceptance"
ON agreement_acceptances FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 6. Milestones
CREATE POLICY "Milestones viewable by project participants"
ON milestones FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = milestones.project_id
        AND (
            projects.client_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM project_members
                WHERE project_members.project_id = milestones.project_id
                AND project_members.user_id = auth.uid()
            )
        )
    )
);

-- 7. Deliverables
CREATE POLICY "Deliverables viewable by project participants"
ON deliverables FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM milestones m
        JOIN projects p ON p.id = m.project_id
        WHERE m.id = deliverables.milestone_id
        AND (
            p.client_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Freelancers can submit deliverables"
ON deliverables FOR INSERT
TO authenticated
WITH CHECK (submitted_by = auth.uid());

-- 8. Verification Reports
CREATE POLICY "Verification reports viewable by project participants"
ON verification_reports FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM milestones m
        JOIN projects p ON p.id = m.project_id
        WHERE m.id = verification_reports.milestone_id
        AND (
            p.client_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
            )
        )
    )
);

-- 9. Invoices & Payments - Read-only to participants, write restricted to service role
CREATE POLICY "Invoices viewable by client or freelancer"
ON invoices FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR freelancer_id = auth.uid());

CREATE POLICY "Payments viewable by client or freelancer"
ON payments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = payments.invoice_id
        AND (invoices.client_id = auth.uid() OR invoices.freelancer_id = auth.uid())
    )
);

-- 10. Trust Ledger - Strictly Append-Only, No direct updates or deletes permitted
CREATE POLICY "Trust ledger viewable by project participants"
ON trust_events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = trust_events.project_id
        AND (
            projects.client_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM project_members
                WHERE project_members.project_id = trust_events.project_id
                AND project_members.user_id = auth.uid()
            )
        )
    )
);

-- Prevent unauthorized updates/deletions on financial & trust audit tables
CREATE OR REPLACE FUNCTION prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Modifications or deletions to % are strictly forbidden by integrity policies.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_trust_events ON trust_events;
CREATE TRIGGER trg_immutable_trust_events
BEFORE UPDATE OR DELETE ON trust_events
FOR EACH ROW EXECUTE FUNCTION prevent_modification();

DROP TRIGGER IF EXISTS trg_immutable_payments ON payments;
CREATE TRIGGER trg_immutable_payments
BEFORE UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION prevent_modification();

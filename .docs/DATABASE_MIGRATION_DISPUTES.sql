-- Tournament Disputes Table Migration
-- Required for Phase 7: Polish & Dispute Flow

-- Create tournament_disputes table
CREATE TABLE IF NOT EXISTS public.tournament_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES public.tournament_rounds (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.golfer_profiles (user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'dismissed'
        )
    ),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.golfer_profiles (user_id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (round_id, user_id) -- One dispute per user per round
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tournament_disputes_course_id ON public.tournament_disputes (course_id);

CREATE INDEX IF NOT EXISTS idx_tournament_disputes_round_id ON public.tournament_disputes (round_id);

CREATE INDEX IF NOT EXISTS idx_tournament_disputes_user_id ON public.tournament_disputes (user_id);

CREATE INDEX IF NOT EXISTS idx_tournament_disputes_status ON public.tournament_disputes (status);

CREATE INDEX IF NOT EXISTS idx_tournament_disputes_created_at ON public.tournament_disputes (created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.tournament_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own disputes
CREATE POLICY "Users can view own disputes" ON public.tournament_disputes FOR
SELECT USING (user_id = auth.uid ());

-- RLS Policy: Users can insert their own disputes
CREATE POLICY "Users can insert own disputes" ON public.tournament_disputes FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

-- RLS Policy: Only admins can update dispute status
-- (Requires is_admin column in golfer_profiles or separate admin table)
CREATE POLICY "Course Manager can update disputes" ON public.tournament_disputes
  FOR UPDATE USING (
      (
        (
          (
            (
              SELECT auth.jwt() AS jwt
            )->'user_metadata'::text
          )->>'is_course_manager'::text
        )::boolean
      )
      AND (
        (
          (
            (
              SELECT auth.jwt() AS jwt
            )->'user_metadata'::text
          )->>'home_course_id'::text
        )::uuid = course_id
    )
  );

-- Create view for dispute status with tournament details
CREATE OR REPLACE VIEW public.tournament_disputes_with_details AS
SELECT
    td.id,
    td.round_id,
    td.user_id,
    td.reason,
    td.status,
    td.admin_notes,
    td.reviewed_by,
    td.reviewed_at,
    td.created_at,
    td.updated_at,
    tr.tournament_id,
    tr.gross_score,
    tr.net_score,
    gp.first_name,
    gp.last_name,
    t.name as tournament_name,
    tg.name as group_name
FROM
    public.tournament_disputes td
    JOIN public.tournament_rounds tr ON td.round_id = tr.id
    JOIN public.golfer_profiles gp ON td.user_id = gp.user_id
    JOIN public.tournaments t ON tr.tournament_id = t.id
    JOIN public.tournament_groups tg ON tr.golf_round_group_id = tg.id;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tournament_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER tournament_disputes_updated_at
  BEFORE UPDATE ON public.tournament_disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_disputes_updated_at();

-- Audit function: Log all dispute status changes
CREATE OR REPLACE FUNCTION log_dispute_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      user_id,
      created_at
    ) VALUES (
      'tournament_disputes',
      NEW.id::text,
      'status_change',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      auth.uid(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
CREATE TRIGGER tournament_disputes_audit_log
  AFTER UPDATE ON public.tournament_disputes
  FOR EACH ROW
  EXECUTE FUNCTION log_dispute_status_change();

-- Seed sample data (optional, for testing)
-- INSERT INTO public.tournament_disputes (round_id, user_id, reason, status)
-- SELECT id, user_id, 'Test dispute reason', 'pending'
-- FROM tournament_rounds
-- LIMIT 1;

-- Verify schema
-- SELECT * FROM public.tournament_disputes;
-- SELECT * FROM public.tournament_disputes_with_details;

-- Notes:
-- 1. Requires is_admin column in golfer_profiles table
-- 2. Requires audit_log table for audit trail
-- 3. Update RLS policies based on your admin implementation
-- 4. Consider adding notifications on dispute status change
-- 5. Add cleanup job to auto-dismiss pending disputes after 30 days
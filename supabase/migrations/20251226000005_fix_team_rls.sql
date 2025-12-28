-- Fix infinite recursion in team_members RLS policies
-- Drop existing policies and recreate without recursion

-- Drop existing policies on team_members
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Team members can view members" ON team_members;

-- Drop existing policies on team_invites
DROP POLICY IF EXISTS "Team admins can manage invites" ON team_invites;

-- For team_members: Allow users to see their own membership
CREATE POLICY "Users can view own membership"
ON team_members FOR SELECT
USING (auth.uid() = user_id);

-- For team_members: Allow users to view teammates (using teams table, not team_members)
CREATE POLICY "Users can view teammates"
ON team_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  )
  OR
  user_id = auth.uid()
);

-- For team_members: Team owners can manage all members
CREATE POLICY "Team owners can manage members"
ON team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  )
);

-- For team_members: Users can insert themselves (for accepting invites)
CREATE POLICY "Users can add themselves as members"
ON team_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- For team_members: Users can delete themselves (leave team)
CREATE POLICY "Users can remove themselves"
ON team_members FOR DELETE
USING (auth.uid() = user_id);

-- For team_invites: Team owners can manage
CREATE POLICY "Team owners can manage invites"
ON team_invites FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_invites.team_id
    AND teams.owner_id = auth.uid()
  )
);

-- For team_invites: Anyone can view invites by token (for accepting)
CREATE POLICY "Anyone can view invites by token"
ON team_invites FOR SELECT
USING (true);

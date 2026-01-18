'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  role: string;
  owner_id: string;
}

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface TeamSectionProps {
  tier: 'free' | 'pro' | 'business';
}

export function TeamSection({ tier }: TeamSectionProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (tier === 'business') {
      fetchTeams();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchTeams is stable, only need to run when tier changes
  }, [tier]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id);
      fetchInvites(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
        if (data.teams.length > 0 && !selectedTeam) {
          setSelectedTeam(data.teams[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchInvites = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/invites`);
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites);
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const data = await res.json();
      setTeams([...teams, { ...data.team, role: 'owner' }]);
      setSelectedTeam({ ...data.team, role: 'owner' });
      setNewTeamName('');
      setShowCreateTeam(false);
      toast.success('Team created');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    }
  };

  const handleInvite = async () => {
    if (!selectedTeam || !inviteEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      const data = await res.json();
      setInvites([data.invite, ...invites]);
      setInviteLink(data.invite_link);
      setInviteEmail('');
      toast.success('Invite sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invite');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      setMembers(members.filter(m => m.user.id !== userId));
      toast.success('Member removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  // Not business tier
  if (tier !== 'business') {
    return (
      <Card className="p-6 glass mb-6">
        <h2 className="text-lg font-semibold mb-2">Team Members</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Collaborate with your team by sharing QR code access.
          This feature is available on the Business plan.
        </p>
        <Button variant="outline" asChild>
          <a href="#billing">Upgrade to Business</a>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Team</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team members and invitations
          </p>
        </div>
        {!showCreateTeam && teams.length < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateTeam(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Team
          </Button>
        )}
      </div>

      {/* Create Team Form */}
      {showCreateTeam && (
        <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
          <Label>Team Name</Label>
          <Input
            placeholder="e.g., Marketing Team"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="mt-1 mb-3 bg-secondary/50"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateTeam} size="sm">Create Team</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateTeam(false);
                setNewTeamName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Create a team to start collaborating with others.
          </p>
          {!showCreateTeam && (
            <Button onClick={() => setShowCreateTeam(true)}>
              Create Your First Team
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Team Selector */}
          {teams.length > 1 && (
            <div className="mb-4">
              <Label>Select Team</Label>
              <select
                value={selectedTeam?.id || ''}
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value);
                  if (team) setSelectedTeam(team);
                }}
                className="w-full mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTeam && (
            <>
              {/* Members List */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Members</h3>
                  {['owner', 'admin'].includes(selectedTeam.role) && !showInvite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInvite(true)}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  )}
                </div>

                {/* Invite Form */}
                {showInvite && (
                  <div className="mb-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 bg-secondary/50"
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                        className="px-3 py-2 rounded-md bg-secondary/50 border border-input"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleInvite} size="sm">Send Invite</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowInvite(false);
                          setInviteEmail('');
                          setInviteLink(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {inviteLink && (
                      <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs">
                        <p className="text-emerald-400 mb-1">Invite link (share this):</p>
                        <code className="break-all">{inviteLink}</code>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {member.user.full_name || member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.user.email} &bull;{' '}
                          <span className="capitalize">{member.role}</span>
                        </p>
                      </div>
                      {['owner', 'admin'].includes(selectedTeam.role) &&
                       member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveMember(member.user.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invites */}
              {invites.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Pending Invites</h3>
                  <div className="space-y-2">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                      >
                        <div>
                          <p className="text-sm">{invite.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {invite.role}
                          </p>
                        </div>
                        <span className="text-xs text-amber-500">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Card>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

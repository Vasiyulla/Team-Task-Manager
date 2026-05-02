import React, { useState, useEffect } from 'react';
import { getTeamById, addTeamMember, removeTeamMember, updateTeamMemberRole, setPrimaryLead, toggleTeamLeadStatus } from '../api/teamClient';
import Button from './Button';
import Input from './Input';
import { Crown, Shield, User, XCircle, ChevronDown, Star } from 'lucide-react';

const TeamMembersPanel = ({ teamId, team, currentUserRole, onMembersUpdate }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [members, setMembers] = useState(team?.members || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleToAssign, setRoleToAssign] = useState('member');

  useEffect(() => {
    setMembers(team?.members || []);
    if (showAddMember) {
      fetchAllUsers();
    }
  }, [team, showAddMember]);

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setAllUsers(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
     u.email.toLowerCase().includes(userSearch.toLowerCase())) &&
    !members.some(m => m.id === u.id) &&
    u.id !== team?.ownerId
  );

  const handleAddMember = async (e) => {
    if (e) e.preventDefault();
    
    const userToAdd = selectedUser || filteredUsers[0];
    if (!userToAdd) {
      setError('Please select a user to add');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addTeamMember(teamId, userToAdd.email);
      // If adding as lead, update the role immediately after adding
      if (roleToAssign === 'lead') {
        const teamData = await getTeamById(teamId);
        const newMember = teamData.data.members.find(m => m.email === userToAdd.email);
        if (newMember) {
          await updateTeamMemberRole(teamId, newMember.id, 'lead');
        }
      }
      setUserSearch('');
      setSelectedUser(null);
      setRoleToAssign('member');
      setShowAddMember(false);
      onMembersUpdate?.();
      const updatedTeam = await getTeamById(teamId);
      setMembers(updatedTeam.data.members || []);
    } catch (err) {
      setError(err.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeTeamMember(teamId, memberId);
        setMembers(members.filter(m => m.id !== memberId));
        onMembersUpdate?.();
      } catch (err) {
        setError(err.error || 'Failed to remove member');
      }
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateTeamMemberRole(teamId, memberId, newRole);
      setMembers(members.map(m =>
        m.id === memberId
          ? { ...m, TeamMember: { ...m.TeamMember, role: newRole } }
          : m
      ));
    } catch (err) {
      setError(err.error || 'Failed to update role');
    }
  };

  const handleSetPrimaryLead = async (memberId) => {
    try {
      await setPrimaryLead(teamId, memberId);
      const updatedTeam = await getTeamById(teamId);
      setMembers(updatedTeam.data.members || []);
      onMembersUpdate?.();
    } catch (err) {
      setError(err.error || 'Failed to set primary lead');
    }
  };

  const handleToggleTeamLead = async (memberId, currentLeadStatus) => {
    try {
      await toggleTeamLeadStatus(teamId, memberId, !currentLeadStatus);
      const updatedTeam = await getTeamById(teamId);
      setMembers(updatedTeam.data.members || []);
      onMembersUpdate?.();
    } catch (err) {
      setError(err.error || 'Failed to update lead status');
    }
  };

  const userId = localStorage.getItem('userId');
  const isOwner = currentUserRole === 'admin' || String(team?.ownerId) === String(userId);
  const isLead = members.some(m => String(m.id) === String(userId) && m.TeamMember?.role === 'lead');

  // Show Add Member button if user is owner, lead, or admin
  const canManage = isOwner || currentUserRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Roster</h3>
          <p className="text-xs text-gray-500">{members.length} members currently in team</p>
        </div>
        {(isOwner || isLead) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddMember(!showAddMember)}
            className="gap-2"
          >
            {showAddMember ? 'Close' : <><User size={16} /> Add Member</>}
          </Button>
        )}
      </div>

        <form onSubmit={handleAddMember} className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-900/20 space-y-4">
          <div className="relative">
            <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-1 sm:text-center">Search and Select Member</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setSelectedUser(null);
                  }}
                  className="bg-white"
                />
                {userSearch && !selectedUser && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setUserSearch(u.name);
                          }}
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer flex items-center gap-3 border-b last:border-0 border-gray-100 dark:border-gray-800"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold uppercase">{u.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">No users found or they are already in the team</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row sm:flex-col gap-2">
                <select 
                  value={roleToAssign}
                  onChange={(e) => setRoleToAssign(e.target.value)}
                  className="flex-1 sm:flex-none p-2 text-xs border border-gray-200 rounded-lg bg-white outline-none"
                >
                  <option value="member">Add as Member</option>
                  <option value="lead">Add as Team Lead</option>
                </select>
                <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!selectedUser && filteredUsers.length === 0} className="flex-1 sm:w-full">
                  Add to Team
                </Button>
              </div>
            </div>
          </div>
        </form>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/20 flex items-center gap-2">
          <XCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {members.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200">
            <User className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-500 dark:text-gray-400">No members found in this team roster.</p>
          </div>
        ) : (
          members.map((member) => {
            const isOwner = String(member.id) === String(team?.ownerId);
            const isLead = member.TeamMember?.role === 'lead';
            const role = isOwner ? 'owner' : (isLead ? 'lead' : 'member');
            
            return (
              <div
                key={member.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                  role === 'lead' 
                    ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30' 
                    : role === 'owner'
                    ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                      role === 'lead' ? 'bg-amber-100 text-amber-700' : 
                      role === 'owner' ? 'bg-purple-100 text-purple-700' : 
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {member.name?.charAt(0)?.toUpperCase()}
                    </span>
                    {role === 'lead' && (
                      <div className="absolute -top-2 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-sm">
                        <Crown size={10} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                      {role === 'owner' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          Owner
                        </span>
                      )}
                      {role === 'lead' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Crown size={10} /> Primary Lead
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canManage && !isOwner && (
                    <>
                      <button
                        onClick={() => handleRoleChange(member.id, isLead ? 'member' : 'lead')}
                        title={isLead ? "Demote to Member" : "Promote to Lead"}
                        className={`p-2 rounded-lg transition-colors ${
                          isLead
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        }`}
                      >
                        <Crown size={16} fill={isLead ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove Member"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeamMembersPanel;

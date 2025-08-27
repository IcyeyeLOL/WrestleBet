"use client";

import { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ limit: 20, offset: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [searchTerm, pagination.offset]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, amount = 0, reason = '') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        body: JSON.stringify({
          id: userId,
          action,
          amount,
          reason,
          adminUserId: 'admin-user-id' // This should come from auth context
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update the user in the list
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...data.user } : user
        ));
        setShowUserModal(false);
        alert(data.message);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to perform user action:', error);
      alert('Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users?id=${userId}&adminUserId=admin-user-id&confirm=true`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(user => user.id !== userId));
        setShowUserModal(false);
        alert('User deleted successfully');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const UserModal = ({ user, onClose }) => {
    const [balanceAction, setBalanceAction] = useState('add_balance');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      const actionAmount = balanceAction === 'reset_balance' ? 0 : parseInt(amount);
      handleUserAction(user.id, balanceAction, actionAmount, reason);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Manage User: {user.username}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Username</p>
                <p className="text-white font-semibold">{user.username}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Balance</p>
                <p className="text-yellow-400 font-bold">{user.wrestlecoin_balance} WC</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-purple-400 font-semibold">{user.total_spent} WC</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Winnings</p>
                <p className="text-green-400 font-semibold">{user.total_winnings} WC</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-blue-400 font-semibold">{user.winRate?.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{user.totalBets}</p>
              <p className="text-xs text-gray-400">Total Bets</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{user.totalWins}</p>
              <p className="text-xs text-gray-400">Total Wins</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{user.recentActivity?.length || 0}</p>
              <p className="text-xs text-gray-400">Recent Activity</p>
            </div>
          </div>

          {/* Recent Activity */}
          {user.recentActivity && user.recentActivity.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">Recent Activity</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {user.recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded text-sm">
                    <span className="text-gray-300 capitalize">{activity.category.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${activity.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {activity.amount > 0 ? '+' : ''}{activity.amount} WC
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Balance Management Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action
              </label>
              <select
                value={balanceAction}
                onChange={(e) => setBalanceAction(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
              >
                <option value="add_balance">Add Balance</option>
                <option value="remove_balance">Remove Balance</option>
                <option value="set_balance">Set Balance</option>
                <option value="reset_balance">Reset to Default (1000 WC)</option>
              </select>
            </div>

            {balanceAction !== 'reset_balance' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (WC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                  min="1"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                rows="2"
                placeholder="Admin adjustment reason..."
              />
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleDeleteUser(user.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                disabled={actionLoading}
              >
                Delete User
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Apply Action'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 w-64"
          />
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading users...</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stats</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-semibold">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-yellow-400 font-bold">{user.wrestlecoin_balance} WC</p>
                          <p className="text-gray-400 text-sm">Current Balance</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-gray-400">Bets:</span> 
                            <span className="text-white ml-1">{user.totalBets}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-400">Win Rate:</span> 
                            <span className="text-green-400 ml-1">{user.winRate?.toFixed(1)}%</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-gray-400">Spent:</span> 
                            <span className="text-purple-400 ml-1">{user.total_spent} WC</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-400">Won:</span> 
                            <span className="text-green-400 ml-1">{user.total_winnings} WC</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.offset + users.length)} of results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={!pagination.hasMore}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }} 
        />
      )}
    </div>
  );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Send,
  Clock,
  UserCheck,
  BookOpen,
  ActivitySquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const FriendsPage = () => {
  const { user, profile } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [sharedModules, setSharedModules] = useState([]);
  const [friendActivity, setFriendActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadFriendData = async () => {
      try {
        setLoading(true);

        if (!user) return;

        const { data: friendsList } = await supabase
          .from('friendships')
          .select('friend_id, profiles(id, full_name, email, avatar_url)')
          .eq('user_id', user.id)
          .eq('status', 'accepted');

        setFriends(friendsList || []);

        const { data: pending } = await supabase
          .from('friendships')
          .select(
            'id, requester_id, profiles(id, full_name, email, avatar_url)'
          )
          .eq('user_id', user.id)
          .eq('status', 'pending');

        setPendingRequests(pending || []);

        const { data: sent } = await supabase
          .from('friendships')
          .select('id, friend_id, profiles(id, full_name, email, avatar_url)')
          .eq('requester_id', user.id)
          .eq('status', 'pending');

        setSentRequests(sent || []);

        const { data: shared } = await supabase
          .from('shared_modules')
          .select('modules(id, title, color, description)')
          .eq('shared_with_id', user.id);

        setSharedModules(shared || []);

        const { data: activity } = await supabase
          .from('activity_feed')
          .select('*')
          .in('user_id', [
            ...friendsList.map((f) => f.friend_id),
            ...pending.map((p) => p.requester_id),
          ])
          .order('created_at', { ascending: false })
          .limit(10);

        setFriendActivity(activity || []);
      } catch (error) {
        console.error('Error loading friends:', error);
        toast.error('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    loadFriendData();
  }, [user]);

  const handleSearchUser = async (e) => {
    e.preventDefault();

    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSearching(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('email', searchEmail)
        .single();

      if (error) throw error;

      if (data.id === user.id) {
        toast.error("You can't add yourself");
        return;
      }

      await supabase.from('friendships').insert([
        {
          requester_id: user.id,
          friend_id: data.id,
          status: 'pending',
        },
      ]);

      toast.success('Friend request sent!');
      setSearchEmail('');

      const { data: newRequest } = await supabase
        .from('friendships')
        .select('id, friend_id, profiles(id, full_name, email, avatar_url)')
        .eq('friend_id', data.id)
        .eq('requester_id', user.id)
        .single();

      if (newRequest) {
        setSentRequests((prev) => [newRequest, ...prev]);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (error.code === 'PGRST116') {
        toast.error('User not found');
      } else if (error.message.includes('duplicate')) {
        toast.error('Request already sent or user is a friend');
      } else {
        toast.error('Failed to send friend request');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAcceptRequest = async (requestId, requesterId) => {
    try {
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      const request = pendingRequests.find((r) => r.id === requestId);
      setFriends((prev) => [...prev, { friend_id: requesterId, profiles: request.profiles }]);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));

      toast.success('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await supabase.from('friendships').delete().eq('id', requestId);

      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await supabase
        .from('friendships')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      setFriends((prev) => prev.filter((f) => f.friend_id !== friendId));
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await supabase.from('friendships').delete().eq('id', requestId);

      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success('Request cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '600px',
        }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  };

  const searchFormStyle = {
    display: 'flex',
    gap: '12px',
  };

  const searchInputStyle = {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const tabsStyle = {
    display: 'flex',
    gap: '16px',
    borderBottom: '1px solid #252532',
  };

  const tabStyle = (active) => ({
    padding: '12px 0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #6c5ce7' : '2px solid transparent',
    color: active ? '#6c5ce7' : '#a0a0b0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const userCardStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#6c5ce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
  };

  const userDetailsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const userNameStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const userEmailStyle = {
    fontSize: '12px',
    color: '#a0a0b0',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '8px',
  };

  const moduleCardStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
  };

  const moduleNameStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: '4px',
  };

  const moduleDescStyle = {
    fontSize: '12px',
    color: '#a0a0b0',
  };

  const emptyStateStyle = {
    padding: '48px 24px',
    textAlign: 'center',
    color: '#a0a0b0',
    backgroundColor: '#1a1a24',
    borderRadius: '8px',
  };

  const activityItemStyle = {
    padding: '12px 16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#a0a0b0',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Friends</h1>
      </div>

      <form onSubmit={handleSearchUser} style={searchFormStyle}>
        <input
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Search user by email..."
          style={searchInputStyle}
        />
        <Button
          type="submit"
          variant="primary"
          loading={searching}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UserPlus size={18} />
          Add Friend
        </Button>
      </form>

      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'friends')}
          onClick={() => setActiveTab('friends')}
        >
          <Users size={18} />
          Friends ({friends.length})
        </button>
        <button
          style={tabStyle(activeTab === 'pending')}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={18} />
          Pending ({pendingRequests.length})
        </button>
        <button
          style={tabStyle(activeTab === 'sent')}
          onClick={() => setActiveTab('sent')}
        >
          <Send size={18} />
          Sent ({sentRequests.length})
        </button>
      </div>

      {activeTab === 'friends' && (
        <>
          {friends.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map((friend) => (
                <div key={friend.friend_id} style={userCardStyle}>
                  <div style={userInfoStyle}>
                    <div style={avatarStyle}>
                      {getInitials(friend.profiles?.full_name)}
                    </div>
                    <div style={userDetailsStyle}>
                      <div style={userNameStyle}>
                        {friend.profiles?.full_name || 'Unknown'}
                      </div>
                      <div style={userEmailStyle}>{friend.profiles?.email}</div>
                    </div>
                  </div>
                  <div style={buttonGroupStyle}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toast.info('Profile feature coming soon')}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveFriend(friend.friend_id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card style={{ padding: '48px 24px' }}>
              <div style={emptyStateStyle}>
                <Users size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
                <div>No friends yet. Add a friend to get started!</div>
              </div>
            </Card>
          )}
        </>
      )}

      {activeTab === 'pending' && (
        <>
          {pendingRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingRequests.map((request) => (
                <div key={request.id} style={userCardStyle}>
                  <div style={userInfoStyle}>
                    <div style={avatarStyle}>
                      {getInitials(request.profiles?.full_name)}
                    </div>
                    <div style={userDetailsStyle}>
                      <div style={userNameStyle}>
                        {request.profiles?.full_name || 'Unknown'}
                      </div>
                      <div style={userEmailStyle}>{request.profiles?.email}</div>
                    </div>
                  </div>
                  <div style={buttonGroupStyle}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleAcceptRequest(request.id, request.requester_id)
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={16} />
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <X size={16} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card style={{ padding: '48px 24px' }}>
              <div style={emptyStateStyle}>
                <Clock size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
                <div>No pending requests</div>
              </div>
            </Card>
          )}
        </>
      )}

      {activeTab === 'sent' && (
        <>
          {sentRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sentRequests.map((request) => (
                <div key={request.id} style={userCardStyle}>
                  <div style={userInfoStyle}>
                    <div style={avatarStyle}>
                      {getInitials(request.profiles?.full_name)}
                    </div>
                    <div style={userDetailsStyle}>
                      <div style={userNameStyle}>
                        {request.profiles?.full_name || 'Unknown'}
                      </div>
                      <div style={userEmailStyle}>{request.profiles?.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card style={{ padding: '48px 24px' }}>
              <div style={emptyStateStyle}>
                <Send size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
                <div>No sent requests</div>
              </div>
            </Card>
          )}
        </>
      )}

      {sharedModules.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
            Modules Shared With You
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {sharedModules.map((item) => (
              <div key={item.modules.id} style={moduleCardStyle}>
                <div style={moduleNameStyle}>{item.modules.title}</div>
                {item.modules.description && (
                  <div style={moduleDescStyle}>{item.modules.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {friendActivity.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
            Friends Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {friendActivity.map((activity) => (
              <div key={activity.id} style={activityItemStyle}>
                {activity.description}
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    color: '#6c5ce7',
                  }}
                >
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  BarChart3,
  Flame,
  Upload,
  Play,
  Zap,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModuleContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { modules, fetchModules } = useModules();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalModules: 0,
    totalFlashcards: 0,
    studySessions: 0,
    averageScore: 0,
  });
  const [streak, setStreak] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const { data: userModules } = await supabase
          .from('modules')
          .select('id, title, color, icon')
          .eq('user_id', user.id);

        const { data: flashcards } = await supabase
          .from('flashcards')
          .select('id')
          .eq('user_id', user.id);

        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('id, score_percentage, module_id, started_at')
          .eq('user_id', user.id);

        const avgScore =
          sessions && sessions.length > 0
            ? Math.round(
                sessions.reduce((sum, s) => sum + (s.score_percentage || 0), 0) /
                  sessions.length
              )
            : 0;

        setStats({
          totalModules: userModules?.length || 0,
          totalFlashcards: flashcards?.length || 0,
          studySessions: sessions?.length || 0,
          averageScore: avgScore,
        });

        try {
          const { data: activity } = await supabase
            .from('activity_feed')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          setRecentActivity(activity || []);
        } catch (actErr) {
          console.warn('Activity feed not available:', actErr);
          setRecentActivity([]);
        }

        if (sessions && sessions.length > 0 && userModules) {
          const moduleMap = (userModules || []).reduce((acc, m) => {
            acc[m.id] = m;
            return acc;
          }, {});

          const weakTopicsList = sessions
            .filter((s) => s.score_percentage != null)
            .sort((a, b) => (a.score_percentage || 0) - (b.score_percentage || 0))
            .slice(0, 5)
            .map((stat) => ({
              ...moduleMap[stat.module_id],
              score: stat.score_percentage,
            }))
            .filter((t) => t && t.id);

          setWeakTopics(weakTopicsList);
        }

        if (sessions && sessions.length > 0) {
          const sorted = [...sessions].sort(
            (a, b) => new Date(b.started_at) - new Date(a.started_at)
          );
          const lastSession = new Date(sorted[0].started_at);
          const today = new Date();
          const daysDiff = Math.floor(
            (today - lastSession) / (1000 * 60 * 60 * 24)
          );
          setStreak(daysDiff <= 1 ? 1 : 0);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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
    gap: '32px',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#a0a0b0',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  };

  const statCardStyle = {
    padding: '20px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  };

  const statIconStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    color: '#ffffff',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    marginBottom: '8px',
  };

  const statValueStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
  };

  const activityStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const activityItemStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const activityTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const activityTitleStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const activityTimeStyle = {
    fontSize: '12px',
    color: '#a0a0b0',
  };

  const quickActionsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  };

  const statCards = [
    {
      icon: BookOpen,
      label: 'Total Modules',
      value: stats.totalModules,
      color: '#6c5ce7',
    },
    {
      icon: Layers,
      label: 'Total Flashcards',
      value: stats.totalFlashcards,
      color: '#45B7D1',
    },
    {
      icon: BarChart3,
      label: 'Study Sessions',
      value: stats.studySessions,
      color: '#4ECDC4',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      color: '#F7DC6F',
    },
  ];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
        </h1>
        <p style={subtitleStyle}>
          Keep up the momentum with your studies. You're doing great!
        </p>
      </div>

      <div style={statsGridStyle}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} style={statCardStyle}>
              <div style={{ ...statIconStyle, backgroundColor: stat.color }}>
                <Icon size={24} />
              </div>
              <div style={statLabelStyle}>{stat.label}</div>
              <div style={statValueStyle}>{stat.value}</div>
            </Card>
          );
        })}
      </div>

      {streak > 0 && (
        <Card
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 160, 122, 0.1) 100%)',
            borderColor: '#FF6B6B',
          }}
        >
          <Flame size={32} style={{ color: '#FF6B6B' }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
              {streak} Day Study Streak!
            </div>
            <div style={{ fontSize: '14px', color: '#a0a0b0' }}>
              Great consistency! Keep studying daily to maintain your streak.
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={activityStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0' }}>
            Recent Activity
          </h2>
          {recentActivity.length > 0 ? (
            <div style={activityStyle}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={activityItemStyle}>
                  <div style={activityTextStyle}>
                    <div style={activityTitleStyle}>{activity.activity_type?.replace(/_/g, ' ') || 'Activity'}</div>
                    <div style={activityTimeStyle}>
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#a0a0b0',
              }}
            >
              No activity yet. Start studying!
            </div>
          )}
        </div>

        <div style={activityStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0' }}>
            Areas to Improve
          </h2>
          {weakTopics.length > 0 ? (
            <div style={activityStyle}>
              {weakTopics.map((topic) => (
                <div
                  key={topic.id}
                  style={activityItemStyle}
                  onClick={() => navigate(`/modules/${topic.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 16px rgba(108, 92, 231, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={activityTextStyle}>
                    <div style={activityTitleStyle}>{topic.title}</div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#ff6b6b',
                        fontWeight: '500',
                      }}
                    >
                      Score: {topic.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#a0a0b0',
              }}
            >
              No study sessions yet.
            </div>
          )}
        </div>
      </div>

      <div style={activityStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0' }}>
          Quick Actions
        </h2>
        <div style={quickActionsStyle}>
          <Button
            variant="primary"
            onClick={() => navigate('/modules')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
            }}
          >
            <Zap size={20} />
            Create Module
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
            }}
          >
            <Upload size={20} />
            Upload File
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/flashcards')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
            }}
          >
            <Play size={20} />
            Study Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

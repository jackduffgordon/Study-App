import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  Filter,
  ChevronDown,
  Send,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModuleContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const EssaysPage = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const [essays, setEssays] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [practiceMode, setPracticeMode] = useState(null);
  const [practiceText, setPracticeText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const loadEssays = async () => {
      try {
        setLoading(true);

        if (!user) return;

        const { data } = await supabase
          .from('essay_prompts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setEssays(data || []);
      } catch (error) {
        console.error('Error loading essays:', error);
        toast.error('Failed to load essays');
      } finally {
        setLoading(false);
      }
    };

    loadEssays();
  }, [user]);

  const filteredEssays = selectedModuleId
    ? essays.filter((e) => e.module_id === selectedModuleId)
    : essays;

  const handleSubmitPractice = async () => {
    if (!practiceText.trim()) {
      toast.error('Please write something first');
      return;
    }

    setFeedbackLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-essay-feedback', {
        body: {
          essayId: practiceMode,
          studentEssay: practiceText,
        },
      });

      if (error) throw error;

      setFeedback(data);
      toast.success('Feedback generated!');
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast.error('Failed to generate feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleClosePractice = () => {
    setPracticeMode(null);
    setPracticeText('');
    setFeedback(null);
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

  const filterStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  const selectStyle = {
    flex: 1,
    maxWidth: '300px',
    padding: '10px 12px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    cursor: 'pointer',
  };

  const essayItemStyle = {
    padding: '20px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const essayHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  };

  const essayTitleStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
    lineHeight: '1.5',
  };

  const frameworkBoxStyle = {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #252532',
  };

  const frameworkSectionStyle = {
    marginBottom: '16px',
  };

  const frameworkLabelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6c5ce7',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const frameworkTextStyle = {
    fontSize: '13px',
    color: '#a0a0b0',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    padding: '12px',
    backgroundColor: '#252532',
    borderRadius: '6px',
  };

  const practiceOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: practiceMode ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const practiceModalStyle = {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    padding: '32px',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '200px',
    padding: '16px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    resize: 'vertical',
    marginBottom: '16px',
  };

  const feedbackBoxStyle = {
    padding: '16px',
    backgroundColor: '#252532',
    borderRadius: '8px',
    marginTop: '16px',
  };

  const feedbackScoreStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: '12px',
  };

  const feedbackSectionStyle = {
    marginBottom: '16px',
  };

  const feedbackLabelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#00d2d3',
    marginBottom: '8px',
  };

  const feedbackTextStyle = {
    fontSize: '13px',
    color: '#a0a0b0',
    lineHeight: '1.6',
  };

  const emptyStateStyle = {
    padding: '48px 24px',
    textAlign: 'center',
    color: '#a0a0b0',
    backgroundColor: '#1a1a24',
    borderRadius: '8px',
  };

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Essay Prompts</h1>
      </div>

      <div style={filterStyle}>
        <Filter size={20} style={{ color: '#a0a0b0' }} />
        <select
          value={selectedModuleId}
          onChange={(e) => setSelectedModuleId(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      {filteredEssays.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {filteredEssays.map((essay) => (
            <div
              key={essay.id}
              style={{
                ...essayItemStyle,
                ...(expandedId === essay.id && {
                  backgroundColor: '#252532',
                  borderColor: '#6c5ce7',
                }),
              }}
              onClick={() =>
                setExpandedId(expandedId === essay.id ? null : essay.id)
              }
              onMouseEnter={(e) => {
                if (expandedId !== essay.id) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 16px rgba(108, 92, 231, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (expandedId !== essay.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={essayHeaderStyle}>
                <div style={essayTitleStyle}>{essay.prompt}</div>
                <ChevronDown
                  size={20}
                  style={{
                    color: '#a0a0b0',
                    transform:
                      expandedId === essay.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </div>

              {expandedId === essay.id && (
                <div style={frameworkBoxStyle}>
                  {essay.thesis_suggestion && (
                    <div style={frameworkSectionStyle}>
                      <div style={frameworkLabelStyle}>
                        <Lightbulb size={14} />
                        Thesis Suggestion
                      </div>
                      <div style={frameworkTextStyle}>
                        {essay.thesis_suggestion}
                      </div>
                    </div>
                  )}

                  {essay.key_arguments && (
                    <div style={frameworkSectionStyle}>
                      <div style={frameworkLabelStyle}>
                        <Lightbulb size={14} />
                        Key Arguments
                      </div>
                      <div style={frameworkTextStyle}>
                        {essay.key_arguments}
                      </div>
                    </div>
                  )}

                  {essay.counter_arguments && (
                    <div style={frameworkSectionStyle}>
                      <div style={frameworkLabelStyle}>
                        Counter Arguments
                      </div>
                      <div style={frameworkTextStyle}>
                        {essay.counter_arguments}
                      </div>
                    </div>
                  )}

                  {essay.evidence_points && (
                    <div style={frameworkSectionStyle}>
                      <div style={frameworkLabelStyle}>
                        Evidence Points
                      </div>
                      <div style={frameworkTextStyle}>
                        {essay.evidence_points}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPracticeMode(essay.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '16px',
                    }}
                  >
                    <Zap size={16} />
                    Practice
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card style={{ padding: '48px 24px' }}>
          <div style={emptyStateStyle}>
            <FileText
              size={40}
              style={{ margin: '0 auto 12px', color: '#a0a0b0' }}
            />
            <div>
              {selectedModuleId
                ? 'No essay prompts in this module yet.'
                : 'No essay prompts yet. Create or upload a module to get started!'}
            </div>
          </div>
        </Card>
      )}

      {practiceMode && (
        <div style={practiceOverlayStyle} onClick={handleClosePractice}>
          <div
            style={practiceModalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0',
                }}
              >
                Practice Essay
              </h2>
              <button
                onClick={handleClosePractice}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0a0b0',
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#252532',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#a0a0b0',
                  margin: '0',
                  lineHeight: '1.6',
                }}
              >
                {essays.find((e) => e.id === practiceMode)?.prompt}
              </p>
            </div>

            {!feedback && (
              <>
                <textarea
                  value={practiceText}
                  onChange={(e) => setPracticeText(e.target.value)}
                  placeholder="Write your essay here..."
                  style={textareaStyle}
                />

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button variant="secondary" onClick={handleClosePractice}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitPractice}
                    loading={feedbackLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Send size={16} />
                    Get Feedback
                  </Button>
                </div>
              </>
            )}

            {feedback && (
              <div style={{ flex: 1 }}>
                <div style={feedbackBoxStyle}>
                  {feedback.score && (
                    <div style={feedbackScoreStyle}>
                      Score: {feedback.score}/100
                    </div>
                  )}

                  {feedback.strengths && (
                    <div style={feedbackSectionStyle}>
                      <div style={feedbackLabelStyle}>Strengths</div>
                      <div style={feedbackTextStyle}>
                        {feedback.strengths}
                      </div>
                    </div>
                  )}

                  {feedback.improvements && (
                    <div style={feedbackSectionStyle}>
                      <div style={feedbackLabelStyle}>Areas to Improve</div>
                      <div style={feedbackTextStyle}>
                        {feedback.improvements}
                      </div>
                    </div>
                  )}

                  {feedback.specific_feedback && (
                    <div style={feedbackSectionStyle}>
                      <div style={feedbackLabelStyle}>Feedback</div>
                      <div style={feedbackTextStyle}>
                        {feedback.specific_feedback}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '24px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPracticeText('');
                      setFeedback(null);
                    }}
                  >
                    Try Again
                  </Button>
                  <Button variant="primary" onClick={handleClosePractice}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EssaysPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  File,
  Layers,
  HelpCircle,
  FileText,
  Plus,
  Share2,
  Edit,
  BookOpen,
  Lightbulb,
  Beaker,
  Code,
  Music,
  Palette,
  Globe,
  Target,
  Upload,
  Zap,
  Clock,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow, formatDate } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const iconMap = {
  BookOpen,
  Lightbulb,
  Beaker,
  Code,
  Music,
  Palette,
  Globe,
  Target,
};

const ModuleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [files, setFiles] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('files');

  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setLoading(true);

        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('*')
          .eq('id', id)
          .single();

        if (moduleError) throw moduleError;
        setModule(moduleData);

        const { data: filesData } = await supabase
          .from('files')
          .select('*')
          .eq('module_id', id)
          .order('created_at', { ascending: false });

        setFiles(filesData || []);

        const { data: flashcardsData } = await supabase
          .from('flashcards')
          .select('*')
          .eq('module_id', id)
          .order('created_at', { ascending: false });

        setFlashcards(flashcardsData || []);

        const { data: questionsData } = await supabase
          .from('mcq_questions')
          .select('*')
          .eq('module_id', id)
          .order('created_at', { ascending: false });

        setQuestions(questionsData || []);

        const { data: essaysData } = await supabase
          .from('essay_prompts')
          .select('*')
          .eq('module_id', id)
          .order('created_at', { ascending: false });

        setEssays(essaysData || []);
      } catch (error) {
        console.error('Error loading module:', error);
        toast.error('Failed to load module');
      } finally {
        setLoading(false);
      }
    };

    loadModuleData();
  }, [id]);

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

  if (!module) {
    return (
      <Card style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#a0a0b0' }}>
          Module not found
        </div>
      </Card>
    );
  }

  const Icon = iconMap[module.icon] || BookOpen;
  const isOwner = module.user_id === user?.id;

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    paddingBottom: '24px',
    borderBottom: '1px solid #252532',
  };

  const moduleIconStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    flexShrink: 0,
    backgroundColor: module.color,
  };

  const moduleInfoStyle = {
    flex: 1,
  };

  const moduleTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
  };

  const moduleDescriptionStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    margin: '0 0 16px 0',
    lineHeight: '1.6',
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

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const fileItemStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const fileInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  };

  const fileBadgeStyle = {
    padding: '4px 8px',
    backgroundColor: '#252532',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#a0a0b0',
  };

  const cardItemStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
  };

  const cardQuestionStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: '8px',
  };

  const cardAnswerStyle = {
    fontSize: '13px',
    color: '#a0a0b0',
    lineHeight: '1.5',
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
      <button
        onClick={() => navigate('/modules')}
        style={{
          background: 'none',
          border: 'none',
          color: '#6c5ce7',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px',
          fontWeight: '500',
        }}
        onMouseEnter={(e) => (e.target.style.color = '#7d6ff0')}
        onMouseLeave={(e) => (e.target.style.color = '#6c5ce7')}
      >
        <ArrowLeft size={16} />
        Back to Modules
      </button>

      <div style={headerStyle}>
        <div style={moduleIconStyle}>
          <Icon size={48} />
        </div>
        <div style={moduleInfoStyle}>
          <h1 style={moduleTitleStyle}>{module.title}</h1>
          {module.description && (
            <p style={moduleDescriptionStyle}>{module.description}</p>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            {isOwner && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/upload?moduleId=${id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Upload size={16} />
                  Upload File
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.info('Share feature coming soon')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={16} />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'files')}
          onClick={() => setActiveTab('files')}
          onMouseEnter={(e) => {
            if (activeTab !== 'files') e.target.style.color = '#b0a0ff';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'files') e.target.style.color = '#a0a0b0';
          }}
        >
          <File size={18} />
          Files ({files.length})
        </button>
        <button
          style={tabStyle(activeTab === 'flashcards')}
          onClick={() => setActiveTab('flashcards')}
          onMouseEnter={(e) => {
            if (activeTab !== 'flashcards') e.target.style.color = '#b0a0ff';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'flashcards') e.target.style.color = '#a0a0b0';
          }}
        >
          <Layers size={18} />
          Flashcards ({flashcards.length})
        </button>
        <button
          style={tabStyle(activeTab === 'questions')}
          onClick={() => setActiveTab('questions')}
          onMouseEnter={(e) => {
            if (activeTab !== 'questions') e.target.style.color = '#b0a0ff';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'questions') e.target.style.color = '#a0a0b0';
          }}
        >
          <HelpCircle size={18} />
          Questions ({questions.length})
        </button>
        <button
          style={tabStyle(activeTab === 'essays')}
          onClick={() => setActiveTab('essays')}
          onMouseEnter={(e) => {
            if (activeTab !== 'essays') e.target.style.color = '#b0a0ff';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'essays') e.target.style.color = '#a0a0b0';
          }}
        >
          <FileText size={18} />
          Essays ({essays.length})
        </button>
      </div>

      <div style={contentStyle}>
        {activeTab === 'files' && (
          files.length > 0 ? (
            files.map((file) => (
              <div key={file.id} style={fileItemStyle}>
                <div style={fileInfoStyle}>
                  <File size={20} style={{ color: '#6c5ce7' }} />
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ffffff',
                        marginBottom: '4px',
                      }}
                    >
                      {file.file_name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#a0a0b0',
                      }}
                    >
                      {formatDistanceToNow(new Date(file.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={fileBadgeStyle}>{file.file_type}</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#252532',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color:
                        file.processing_status === 'completed'
                          ? '#00d2d3'
                          : file.processing_status === 'failed'
                          ? '#ff6b6b'
                          : '#a0a0b0',
                    }}
                  >
                    {file.processing_status === 'completed' && (
                      <FileCheck size={12} />
                    )}
                    {file.processing_status === 'failed' && (
                      <AlertCircle size={12} />
                    )}
                    {file.processing_status === 'pending' && (
                      <Clock size={12} />
                    )}
                    {file.processing_status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>
              <File size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
              <div>No files uploaded yet.</div>
            </div>
          )
        )}

        {activeTab === 'flashcards' && (
          flashcards.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {flashcards.map((card) => (
                <div key={card.id} style={cardItemStyle}>
                  <div style={cardQuestionStyle}>{card.question}</div>
                  <div style={cardAnswerStyle}>{card.answer}</div>
                  {card.source_reference && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#6c5ce7',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #252532',
                      }}
                    >
                      Source: {card.source_reference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <Layers size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
              <div>No flashcards yet.</div>
            </div>
          )
        )}

        {activeTab === 'questions' && (
          questions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((question) => (
                <Card key={question.id} style={{ padding: '16px' }}>
                  <div style={cardQuestionStyle}>{question.question}</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: '12px',
                    }}
                  >
                    {question.options && JSON.parse(question.options).map((option, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#252532',
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: '#a0a0b0',
                        }}
                      >
                        {String.fromCharCode(65 + idx)}. {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #252532',
                        fontSize: '12px',
                        color: '#a0a0b0',
                      }}
                    >
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <HelpCircle size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
              <div>No questions yet.</div>
            </div>
          )
        )}

        {activeTab === 'essays' && (
          essays.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {essays.map((essay) => (
                <Card key={essay.id} style={{ padding: '20px' }}>
                  <div style={cardQuestionStyle}>{essay.prompt}</div>
                  {essay.argument_framework && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#252532',
                        borderRadius: '4px',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: '#a0a0b0',
                      }}
                    >
                      <strong style={{ color: '#ffffff' }}>Framework:</strong>
                      <pre
                        style={{
                          margin: '8px 0 0 0',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                        }}
                      >
                        {essay.argument_framework}
                      </pre>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <FileText size={40} style={{ margin: '0 auto 12px', color: '#a0a0b0' }} />
              <div>No essay prompts yet.</div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ModuleDetailPage;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HelpCircle,
  Play,
  Filter,
  ChevronDown,
  RotateCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModuleContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const QuestionsPage = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const [questions, setQuestions] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [sessionResults, setSessionResults] = useState({
    correct: 0,
    incorrect: 0,
    questions: [],
  });
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        if (!user) return;

        const { data } = await supabase
          .from('mcq_questions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setQuestions(data || []);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user]);

  const filteredQuestions = selectedModuleId
    ? questions.filter((q) => q.module_id === selectedModuleId)
    : questions;

  const handleStartQuizMode = () => {
    if (filteredQuestions.length === 0) {
      toast.error('No questions in selected module');
      return;
    }

    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowAnswers(false);
    setSessionResults({ correct: 0, incorrect: 0, questions: [] });
    setShowSummary(false);
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitAnswer = async () => {
    const question = filteredQuestions[currentQuestionIndex];
    const selectedIndex = selectedAnswers[question.id];
    const isCorrect = selectedIndex === question.correct_answer_index;

    setShowAnswers(true);

    setSessionResults((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      questions: [
        ...prev.questions,
        {
          questionId: question.id,
          isCorrect,
        },
      ],
    }));

    setTimeout(() => {
      if (currentQuestionIndex + 1 >= filteredQuestions.length) {
        const sessionDuration = Math.round(
          (new Date() - sessionStartTime) / 1000
        );

        const score = Math.round(
          ((sessionResults.correct + (isCorrect ? 1 : 0)) /
            (sessionResults.correct +
              sessionResults.incorrect +
              1)) *
            100
        );

        try {
          supabase.from('study_sessions').insert([
            {
              user_id: user.id,
              module_id: selectedModuleId || null,
              session_type: 'questions',
              duration_seconds: sessionDuration,
              score,
              correct_count: sessionResults.correct + (isCorrect ? 1 : 0),
              incorrect_count: sessionResults.incorrect + (isCorrect ? 0 : 1),
            },
          ]);

          sessionResults.questions.forEach(async (result) => {
            await supabase.from('study_progress').insert([
              {
                user_id: user.id,
                question_id: result.questionId,
                is_correct: result.isCorrect,
                session_type: 'questions',
              },
            ]);
          });
        } catch (error) {
          console.error('Error saving session:', error);
        }

        setShowSummary(true);
      } else {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowAnswers(false);
        }, 1500);
      }
    }, 1000);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowAnswers(false);
    setSessionResults({ correct: 0, incorrect: 0, questions: [] });
    setShowSummary(false);
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

  const questionItemStyle = {
    padding: '20px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const questionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  };

  const questionTextStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
    lineHeight: '1.5',
  };

  const optionStyle = (selected, isCorrect, isIncorrect, answered) => ({
    padding: '12px 16px',
    backgroundColor:
      answered && isCorrect
        ? 'rgba(0, 210, 211, 0.1)'
        : answered && isIncorrect
        ? 'rgba(255, 107, 107, 0.1)'
        : selected && !answered
        ? 'rgba(108, 92, 231, 0.1)'
        : '#252532',
    border:
      answered && isCorrect
        ? '1px solid #00d2d3'
        : answered && isIncorrect
        ? '1px solid #ff6b6b'
        : selected && !answered
        ? '1px solid #6c5ce7'
        : '1px solid #6c6c7c',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#a0a0b0',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  });

  const quizModeOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: quizMode ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const quizModeContentStyle = {
    width: '100%',
    maxWidth: '700px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    padding: '40px 32px',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const progressBarStyle = {
    width: '100%',
    height: '6px',
    backgroundColor: '#252532',
    borderRadius: '3px',
    marginBottom: '24px',
    overflow: 'hidden',
  };

  const progressFilledStyle = {
    height: '100%',
    backgroundColor: '#6c5ce7',
    width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%`,
    transition: 'width 0.3s ease',
  };

  const summaryStyle = {
    textAlign: 'center',
  };

  const scoreStyle = {
    fontSize: '48px',
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: '16px',
  };

  const summaryLabelStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '24px',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  };

  const statBoxStyle = {
    padding: '16px',
    backgroundColor: '#252532',
    borderRadius: '8px',
  };

  const statValueStyle = (color) => ({
    fontSize: '32px',
    fontWeight: '700',
    color,
    marginBottom: '4px',
  });

  const statLabelStyle = {
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

  const buttonGroupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '24px',
  };

  if (quizMode) {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const selectedIndex = selectedAnswers[currentQuestion.id];
    const options = JSON.parse(currentQuestion.options || '[]');

    return (
      <div style={quizModeOverlayStyle} onClick={() => setQuizMode(false)}>
        <div
          style={quizModeContentStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {showSummary ? (
            <div style={summaryStyle}>
              <div style={scoreStyle}>
                {Math.round(
                  (sessionResults.correct /
                    (sessionResults.correct + sessionResults.incorrect)) *
                    100
                )}
                %
              </div>
              <div style={summaryLabelStyle}>Quiz Complete!</div>

              <div style={statsGridStyle}>
                <div style={statBoxStyle}>
                  <div style={statValueStyle('#00d2d3')}>
                    {sessionResults.correct}
                  </div>
                  <div style={statLabelStyle}>Correct</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={statValueStyle('#ff6b6b')}>
                    {sessionResults.incorrect}
                  </div>
                  <div style={statLabelStyle}>Incorrect</div>
                </div>
              </div>

              <div style={buttonGroupStyle}>
                <Button variant="secondary" onClick={handleRestartQuiz}>
                  <RotateCw size={18} />
                  Restart
                </Button>
                <Button variant="primary" onClick={() => setQuizMode(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '14px', color: '#a0a0b0' }}>
                  Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                </div>
                <button
                  onClick={() => setQuizMode(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    fontSize: '20px',
                  }}
                >
                  ×
                </button>
              </div>

              <div style={progressBarStyle}>
                <div style={progressFilledStyle} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={questionTextStyle}>{currentQuestion.question}</h3>

                <div style={{ marginTop: '20px' }}>
                  {options.map((option, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCorrect =
                      showAnswers && idx === currentQuestion.correct_answer_index;
                    const isIncorrect =
                      showAnswers && isSelected && !isCorrect;

                    return (
                      <div
                        key={idx}
                        style={optionStyle(isSelected, isCorrect, isIncorrect, showAnswers)}
                        onClick={() => {
                          if (!showAnswers) handleSelectAnswer(currentQuestion.id, idx);
                        }}
                        onMouseEnter={(e) => {
                          if (!showAnswers)
                            e.currentTarget.style.backgroundColor =
                              'rgba(108, 92, 231, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (!showAnswers)
                            e.currentTarget.style.backgroundColor =
                              selectedIndex === idx
                                ? 'rgba(108, 92, 231, 0.1)'
                                : '#252532';
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid currentColor',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {showAnswers && isCorrect && (
                            <CheckCircle size={16} style={{ color: '#00d2d3' }} />
                          )}
                          {showAnswers && isIncorrect && (
                            <XCircle size={16} style={{ color: '#ff6b6b' }} />
                          )}
                        </div>
                        {option}
                      </div>
                    );
                  })}
                </div>

                {currentQuestion.explanation && showAnswers && (
                  <div
                    style={{
                      marginTop: '20px',
                      padding: '16px',
                      backgroundColor: '#252532',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#a0a0b0',
                      lineHeight: '1.6',
                    }}
                  >
                    <strong style={{ color: '#00d2d3' }}>Explanation: </strong>
                    {currentQuestion.explanation}
                  </div>
                )}
              </div>

              {!showAnswers && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmitAnswer}
                  disabled={selectedIndex === undefined}
                  style={{ marginTop: '20px' }}
                >
                  Submit Answer
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Questions</h1>
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
        {filteredQuestions.length > 0 && (
          <Button
            variant="primary"
            onClick={handleStartQuizMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Play size={18} />
            Quiz Mode
          </Button>
        )}
      </div>

      {filteredQuestions.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              style={{
                ...questionItemStyle,
                ...(expandedId === question.id && {
                  backgroundColor: '#252532',
                  borderColor: '#6c5ce7',
                }),
              }}
              onClick={() =>
                setExpandedId(
                  expandedId === question.id ? null : question.id
                )
              }
              onMouseEnter={(e) => {
                if (expandedId !== question.id) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 16px rgba(108, 92, 231, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (expandedId !== question.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={questionHeaderStyle}>
                <div style={questionTextStyle}>{question.question}</div>
                <ChevronDown
                  size={20}
                  style={{
                    color: '#a0a0b0',
                    transform:
                      expandedId === question.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </div>

              {expandedId === question.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #252532' }}>
                  {JSON.parse(question.options || '[]').map((option, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#1a1a24',
                        border: '1px solid #252532',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color:
                          idx === question.correct_answer_index
                            ? '#00d2d3'
                            : '#a0a0b0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor:
                            idx === question.correct_answer_index
                              ? 'rgba(0, 210, 211, 0.1)'
                              : 'transparent',
                          border:
                            idx === question.correct_answer_index
                              ? '2px solid #00d2d3'
                              : '2px solid #6c6c7c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx === question.correct_answer_index && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#00d2d3',
                              borderRadius: '50%',
                            }}
                          />
                        )}
                      </div>
                      {option}
                    </div>
                  ))}

                  {question.explanation && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#252532',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#a0a0b0',
                        lineHeight: '1.6',
                      }}
                    >
                      <strong style={{ color: '#00d2d3' }}>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card style={{ padding: '48px 24px' }}>
          <div style={emptyStateStyle}>
            <HelpCircle
              size={40}
              style={{ margin: '0 auto 12px', color: '#a0a0b0' }}
            />
            <div>
              {selectedModuleId
                ? 'No questions in this module yet.'
                : 'No questions yet. Create or upload a module to get started!'}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuestionsPage;

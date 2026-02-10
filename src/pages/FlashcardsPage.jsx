import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RotateCw,
  Play,
  Filter,
  BookOpen,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModuleContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const FlashcardsPage = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const [flashcards, setFlashcards] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [sessionResults, setSessionResults] = useState({
    correct: 0,
    incorrect: 0,
    cards: [],
  });
  const [showSummary, setShowSummary] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setLoading(true);

        if (!user) return;

        const { data } = await supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setFlashcards(data || []);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        toast.error('Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [user]);

  const filteredCards = selectedModuleId
    ? flashcards.filter((c) => c.module_id === selectedModuleId)
    : flashcards;

  const handleStartStudyMode = () => {
    if (filteredCards.length === 0) {
      toast.error('No flashcards in selected module');
      return;
    }

    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionResults({ correct: 0, incorrect: 0, cards: [] });
    setShowSummary(false);
  };

  const handleAnswer = async (isCorrect) => {
    const card = filteredCards[currentCardIndex];

    setSessionResults((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      cards: [
        ...prev.cards,
        {
          cardId: card.id,
          isCorrect,
        },
      ],
    }));

    if (currentCardIndex + 1 >= filteredCards.length) {
      const sessionDuration = Math.round(
        (new Date() - sessionStartTime) / 1000
      );

      const score = Math.round(
        (sessionResults.correct / (sessionResults.correct + sessionResults.incorrect + 1)) * 100
      );

      try {
        await supabase.from('study_sessions').insert([
          {
            user_id: user.id,
            module_id: selectedModuleId || null,
            session_type: 'flashcards',
            duration_seconds: sessionDuration,
            score,
            correct_count: sessionResults.correct + (isCorrect ? 1 : 0),
            incorrect_count: sessionResults.incorrect + (isCorrect ? 0 : 1),
          },
        ]);

        sessionResults.cards.forEach(async (result) => {
          await supabase.from('study_progress').insert([
            {
              user_id: user.id,
              card_id: result.cardId,
              is_correct: result.isCorrect,
              session_type: 'flashcards',
            },
          ]);
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }

      setShowSummary(true);
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleRestartSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionResults({ correct: 0, incorrect: 0, cards: [] });
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  };

  const cardStyle = {
    padding: '20px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const cardInnerStyle = {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px',
  };

  const cardQuestionStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: '1.5',
  };

  const cardAnswerStyle = {
    fontSize: '16px',
    color: '#a0a0b0',
    lineHeight: '1.5',
  };

  const cardMetaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6c5ce7',
  };

  const studyModeOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: studyMode ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const studyModeContentStyle = {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    padding: '40px 24px',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const largeCardStyle = {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 24px',
    backgroundColor: '#252532',
    borderRadius: '12px',
    marginBottom: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid #6c5ce7',
  };

  const largeCardTextStyle = {
    fontSize: '24px',
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: '1.6',
  };

  const smallTextStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    marginTop: '16px',
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
    width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%`,
    transition: 'width 0.3s ease',
  };

  const buttonGroupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  };

  const summaryStyle = {
    textAlign: 'center',
    padding: '40px 24px',
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

  if (studyMode) {
    return (
      <div style={studyModeOverlayStyle} onClick={() => setStudyMode(false)}>
        <div
          style={studyModeContentStyle}
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
              <div style={summaryLabelStyle}>Great effort!</div>

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
                  <div style={statLabelStyle}>Missed</div>
                </div>
              </div>

              <div style={buttonGroupStyle}>
                <Button variant="secondary" onClick={handleRestartSession}>
                  <RotateCw size={18} />
                  Restart
                </Button>
                <Button variant="primary" onClick={() => setStudyMode(false)}>
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
                <div
                  style={{
                    fontSize: '14px',
                    color: '#a0a0b0',
                  }}
                >
                  Card {currentCardIndex + 1} of {filteredCards.length}
                </div>
                <button
                  onClick={() => setStudyMode(false)}
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

              <div
                style={largeCardStyle}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div style={largeCardTextStyle}>
                  {isFlipped
                    ? filteredCards[currentCardIndex]?.answer
                    : filteredCards[currentCardIndex]?.question}
                </div>
                <div style={smallTextStyle}>Click to flip</div>
              </div>

              <div style={buttonGroupStyle}>
                <Button
                  variant="danger"
                  onClick={() => handleAnswer(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <XCircle size={18} />
                  Missed
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleAnswer(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle size={18} />
                  Got It
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Flashcards</h1>
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
        {filteredCards.length > 0 && (
          <Button
            variant="primary"
            onClick={handleStartStudyMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Play size={18} />
            Study Mode
          </Button>
        )}
      </div>

      {filteredCards.length > 0 ? (
        <div style={gridStyle}>
          {filteredCards.map((card) => (
            <div
              key={card.id}
              style={cardStyle}
              onClick={() =>
                setFlippedCards(
                  flippedCards.has(card.id)
                    ? new Set([...flippedCards].filter((id) => id !== card.id))
                    : new Set([...flippedCards, card.id])
                )
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 24px rgba(108, 92, 231, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={cardInnerStyle}>
                {flippedCards.has(card.id) ? (
                  <div style={cardAnswerStyle}>{card.answer}</div>
                ) : (
                  <div style={cardQuestionStyle}>{card.question}</div>
                )}
              </div>
              {card.source_reference && (
                <div style={cardMetaStyle}>
                  <span>{card.source_reference}</span>
                  <span>
                    {flippedCards.has(card.id) ? 'Answer' : 'Click to flip'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card style={{ padding: '48px 24px' }}>
          <div style={emptyStateStyle}>
            <BookOpen
              size={40}
              style={{ margin: '0 auto 12px', color: '#a0a0b0' }}
            />
            <div>
              {selectedModuleId
                ? 'No flashcards in this module yet.'
                : 'No flashcards yet. Create or upload a module to get started!'}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FlashcardsPage;

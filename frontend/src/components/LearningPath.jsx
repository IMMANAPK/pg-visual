import { useState, useEffect } from 'react'
import learningData from '../data/learningData'
import Challenge from './Challenge'

function LearningPath({ onRunQuery, t, language }) {
  const [selectedPath, setSelectedPath] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [activeChallenge, setActiveChallenge] = useState(null)
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('pgvisual-learning-progress')
    return saved ? JSON.parse(saved) : {
      completedChallenges: [],
      points: 0,
      badges: [],
      streak: 0,
      lastPractice: null
    }
  })

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('pgvisual-learning-progress', JSON.stringify(progress))
  }, [progress])

  // Check and update streak
  useEffect(() => {
    const today = new Date().toDateString()
    const lastPractice = progress.lastPractice

    if (lastPractice) {
      const lastDate = new Date(lastPractice)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastDate.toDateString() !== today && lastDate.toDateString() !== yesterday.toDateString()) {
        // Streak broken
        setProgress(prev => ({ ...prev, streak: 0 }))
      }
    }
  }, [])

  const handleChallengeComplete = (challengeId, points) => {
    const today = new Date().toDateString()
    const isNewChallenge = !progress.completedChallenges.includes(challengeId)

    if (isNewChallenge) {
      const newStreak = progress.lastPractice === today ? progress.streak : progress.streak + 1

      setProgress(prev => ({
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        points: prev.points + points,
        streak: newStreak,
        lastPractice: today
      }))

      // Check for badges
      checkBadges(progress.completedChallenges.length + 1, progress.points + points, newStreak)
    }

    // Move to next challenge or back to lesson
    const currentLesson = selectedLesson
    if (currentLesson) {
      const currentIndex = currentLesson.challenges.findIndex(c => c.id === challengeId)
      if (currentIndex < currentLesson.challenges.length - 1) {
        setActiveChallenge(currentLesson.challenges[currentIndex + 1])
      } else {
        setActiveChallenge(null)
      }
    }
  }

  const checkBadges = (completedCount, totalPoints, streak) => {
    const newBadges = []

    // First query badge
    if (completedCount === 1 && !progress.badges.includes('first-query')) {
      newBadges.push('first-query')
    }

    // Points badges
    if (totalPoints >= 100 && !progress.badges.includes('points-100')) {
      newBadges.push('points-100')
    }
    if (totalPoints >= 500 && !progress.badges.includes('points-500')) {
      newBadges.push('points-500')
    }

    // Streak badges
    if (streak >= 3 && !progress.badges.includes('streak-3')) {
      newBadges.push('streak-3')
    }

    // Path completion badges
    learningData.paths.forEach(path => {
      const allChallenges = path.lessons.flatMap(l => l.challenges.map(c => c.id))
      const completed = allChallenges.filter(id => progress.completedChallenges.includes(id) ||
        (newBadges.length > 0 && progress.completedChallenges.concat([allChallenges[completedCount - 1]]).includes(id)))

      if (completed.length === allChallenges.length && !progress.badges.includes(path.id)) {
        newBadges.push(path.id)
      }
    })

    if (newBadges.length > 0) {
      setProgress(prev => ({
        ...prev,
        badges: [...prev.badges, ...newBadges]
      }))
    }
  }

  const getPathProgress = (path) => {
    const allChallenges = path.lessons.flatMap(l => l.challenges.map(c => c.id))
    const completed = allChallenges.filter(id => progress.completedChallenges.includes(id))
    return {
      completed: completed.length,
      total: allChallenges.length,
      percentage: Math.round((completed.length / allChallenges.length) * 100)
    }
  }

  const getLessonProgress = (lesson) => {
    const completed = lesson.challenges.filter(c => progress.completedChallenges.includes(c.id))
    return {
      completed: completed.length,
      total: lesson.challenges.length,
      percentage: Math.round((completed.length / lesson.challenges.length) * 100)
    }
  }

  const renderPathSelection = () => (
    <div className="lp-paths">
      {/* Stats Bar */}
      <div className="lp-stats">
        <div className="lp-stat">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{progress.points}</span>
          <span className="stat-label">{t?.points || 'Points'}</span>
        </div>
        <div className="lp-stat">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{progress.streak}</span>
          <span className="stat-label">{t?.dayStreak || 'Day Streak'}</span>
        </div>
        <div className="lp-stat">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{progress.completedChallenges.length}</span>
          <span className="stat-label">{t?.completed || 'Completed'}</span>
        </div>
        <div className="lp-stat">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{progress.badges.length}</span>
          <span className="stat-label">{t?.badges || 'Badges'}</span>
        </div>
      </div>

      {/* Badges Display */}
      {progress.badges.length > 0 && (
        <div className="lp-badges">
          <h4>{t?.earnedBadges || 'Earned Badges'}</h4>
          <div className="badges-grid">
            {learningData.badges
              .filter(b => progress.badges.includes(b.id))
              .map(badge => (
                <div key={badge.id} className="badge-item" title={badge.description}>
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-title">{badge.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Learning Paths */}
      <div className="lp-path-list">
        <h4>{t?.choosePath || 'Choose Your Learning Path'}</h4>
        {learningData.paths.map(path => {
          const prog = getPathProgress(path)
          return (
            <div
              key={path.id}
              className={`lp-path-card ${prog.percentage === 100 ? 'completed' : ''}`}
              onClick={() => setSelectedPath(path)}
              style={{ borderLeftColor: path.color }}
            >
              <div className="path-header">
                <span className="path-icon">{path.icon}</span>
                <div className="path-info">
                  <h5>{path.title}</h5>
                  <p>{path.lessons.length} {t?.lessons || 'lessons'}</p>
                </div>
                <div className="path-progress">
                  <span>{prog.percentage}%</span>
                </div>
              </div>
              <div className="path-progress-bar">
                <div
                  className="path-progress-fill"
                  style={{ width: `${prog.percentage}%`, backgroundColor: path.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderLessonList = () => (
    <div className="lp-lessons">
      <button className="lp-back-btn" onClick={() => setSelectedPath(null)}>
        ← {t?.back || 'Back'}
      </button>

      <div className="lp-path-header" style={{ borderLeftColor: selectedPath.color }}>
        <span className="path-icon">{selectedPath.icon}</span>
        <h3>{selectedPath.title}</h3>
      </div>

      <div className="lp-lesson-list">
        {selectedPath.lessons.map((lesson, index) => {
          const prog = getLessonProgress(lesson)
          const isLocked = index > 0 && getLessonProgress(selectedPath.lessons[index - 1]).percentage < 50

          return (
            <div
              key={lesson.id}
              className={`lp-lesson-card ${prog.percentage === 100 ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && setSelectedLesson(lesson)}
            >
              <div className="lesson-number">{index + 1}</div>
              <div className="lesson-content">
                <div className="lesson-header">
                  <span className="lesson-icon">{lesson.icon}</span>
                  <h5>{lesson.title}</h5>
                  {prog.percentage === 100 && <span className="check-mark">✓</span>}
                  {isLocked && <span className="lock-icon">🔒</span>}
                </div>
                <p>{language === 'thanglish' ? lesson.descThanglish : lesson.description}</p>
                <div className="lesson-meta">
                  <span>{lesson.challenges.length} {t?.challenges || 'challenges'}</span>
                  <span>{prog.completed}/{prog.total} {t?.completed || 'completed'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderLesson = () => (
    <div className="lp-lesson-view">
      <button className="lp-back-btn" onClick={() => {
        setSelectedLesson(null)
        setActiveChallenge(null)
      }}>
        ← {t?.backToLessons || 'Back to Lessons'}
      </button>

      <div className="lp-lesson-header">
        <span className="lesson-icon">{selectedLesson.icon}</span>
        <h3>{selectedLesson.title}</h3>
      </div>

      {!activeChallenge ? (
        <>
          {/* Theory Section */}
          <div className="lp-theory">
            <h4>📖 {t?.theory || 'Theory'}</h4>
            <div className="theory-content" dangerouslySetInnerHTML={{
              __html: formatTheory(selectedLesson.theory)
            }} />
          </div>

          {/* Challenges List */}
          <div className="lp-challenges-list">
            <h4>🎯 {t?.challenges || 'Challenges'}</h4>
            {selectedLesson.challenges.map((challenge, index) => {
              const isCompleted = progress.completedChallenges.includes(challenge.id)
              return (
                <div
                  key={challenge.id}
                  className={`challenge-card ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setActiveChallenge(challenge)}
                >
                  <div className="challenge-num">{index + 1}</div>
                  <div className="challenge-info">
                    <h5>{challenge.title}</h5>
                    <p>{challenge.task}</p>
                  </div>
                  <div className="challenge-points">
                    {isCompleted ? '✓' : `+${challenge.points}`}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <Challenge
          challenge={activeChallenge}
          onComplete={handleChallengeComplete}
          onRunQuery={onRunQuery}
          isCompleted={progress.completedChallenges.includes(activeChallenge.id)}
          t={t}
        />
      )}
    </div>
  )

  const formatTheory = (theory) => {
    // Simple markdown-like formatting
    return theory
      .replace(/```sql\n([\s\S]*?)```/g, '<pre class="code-block sql">$1</pre>')
      .replace(/```javascript\n([\s\S]*?)```/g, '<pre class="code-block js">$1</pre>')
      .replace(/```\n([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/## (.*)/g, '<h5>$1</h5>')
      .replace(/### (.*)/g, '<h6>$1</h6>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
  }

  return (
    <div className="learning-path">
      <div className="lp-header">
        <span className="lp-icon">📚</span>
        <h3>{t?.learningPath || 'Learning Path'}</h3>
      </div>

      <div className="lp-content">
        {!selectedPath && renderPathSelection()}
        {selectedPath && !selectedLesson && renderLessonList()}
        {selectedLesson && renderLesson()}
      </div>
    </div>
  )
}

export default LearningPath

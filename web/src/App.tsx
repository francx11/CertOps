import { useExamContext } from './context/ExamContext'
import Dashboard from './components/Dashboard'
import QuizContainer from './components/QuizContainer'
import ResultsView from './components/ResultsView'
import TheoryView from './components/theory/TheoryView'

export default function App() {
  const { state } = useExamContext()

  if (state.screen === 'quiz') return <QuizContainer />
  if (state.screen === 'results') return <ResultsView />
  if (state.screen === 'theory') return <TheoryView />
  return <Dashboard />
}

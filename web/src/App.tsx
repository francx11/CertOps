import { useExamContext } from './context/ExamContext'
import Dashboard from './components/Dashboard'
import QuizContainer from './components/QuizContainer'
import ResultsView from './components/ResultsView'

export default function App() {
  const { state } = useExamContext()

  if (state.screen === 'quiz') return <QuizContainer />
  if (state.screen === 'results') return <ResultsView />
  return <Dashboard />
}

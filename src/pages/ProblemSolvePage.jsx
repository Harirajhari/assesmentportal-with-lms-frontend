import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProblem } from '../features/problems/problemSlice'
import { runCode, submitCode, clearResults, setConsoleTab } from '../features/submissions/submissionSlice'
import { patchUser } from '../features/auth/authSlice'
import { useAuth, useNotify } from '../hooks'
import { loadCode } from '../utils/editorUtils'
import CodingWorkspace from '../components/editor/CodingWorkspace'

export default function ProblemSolvePage() {
  const { id }   = useParams()
  const dispatch = useDispatch()
  const notify   = useNotify()
  const { user } = useAuth()

  const { selected: problem, loading } = useSelector(s => s.problems)

  const [language, setLanguage] = useState('python')
  const [code,     setCode]     = useState('')

  useEffect(() => {
    dispatch(fetchProblem(id))
    dispatch(clearResults())
  }, [id, dispatch])

  // Re-load code whenever problem loads, id changes, or language switches
  // Priority: localStorage saved → problem.starterCode[lang] → default template
  useEffect(() => {
    setCode(loadCode(id, language, problem?.starterCode))
  }, [id, language, problem?.starterCode])

  const handleLangChange = useCallback((lang) => {
    setLanguage(lang)
    // loadCode is called via the above useEffect when language state updates
  }, [])

  const handleRun = useCallback(() => {
    if (!code.trim()) return notify.warn('Write some code first!')
    dispatch(setConsoleTab('output'))
    dispatch(runCode({ problemId: id, language, code }))
  }, [code, id, language, dispatch, notify])

  const handleSubmit = useCallback(() => {
    if (!code.trim()) return notify.warn('Write some code first!')
    dispatch(setConsoleTab('output'))
    dispatch(submitCode({ problemId: id, language, code }))
      .unwrap()
      .then(result => {
        const v = result.verdict ?? result.overallStatus
        if (v === 'Accepted') {
          notify.success('🎉 Accepted! Great solve!')
          dispatch(patchUser({ totalSolved: (user?.totalSolved ?? 0) + 1 }))
        } else {
          notify.error(`${v ?? 'Failed'} — keep trying!`)
        }
      })
      .catch(e => notify.error(typeof e === 'string' ? e : 'Submission failed'))
  }, [code, id, language, dispatch, notify, user])

  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden">
      <CodingWorkspace
        problemId={id}
        problem={problem}
        problemLoading={loading}
        code={code}
        onCodeChange={setCode}
        language={language}
        onLangChange={handleLangChange}
        onRun={handleRun}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
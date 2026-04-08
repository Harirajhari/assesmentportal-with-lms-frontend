import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProblem } from '../features/problems/problemSlice'
import { runCode, submitCode, clearResults } from '../features/submissions/submissionSlice'
import { patchUser } from '../features/auth/authSlice'
import { useAuth, useNotify } from '../hooks'
import { loadCode, TEMPLATES } from '../utils/editorUtils'
import ProblemPanel from '../components/editor/ProblemPanel'
import CodeEditor   from '../components/editor/CodeEditor'
import OutputPanel  from '../components/editor/OutputPanel'

export default function ProblemSolvePage() {
  const { id }   = useParams()
  const dispatch = useDispatch()
  const notify   = useNotify()
  const { user } = useAuth()

  const { selected: problem, loading } = useSelector(s => s.problems)

  const [language, setLanguage] = useState('python')
  const [code, setCode]         = useState(TEMPLATES['python'])

  // Fetch problem
  useEffect(() => {
    dispatch(fetchProblem(id))
    dispatch(clearResults())
  }, [id, dispatch])

  // Load saved code when problem + language changes
  useEffect(() => {
    setCode(loadCode(id, language))
  }, [id, language])

  // Handle language switch (load code for that lang)
  const handleLangChange = useCallback((lang) => {
    setLanguage(lang)
    setCode(loadCode(id, lang))
  }, [id])

  const handleRun = useCallback(() => {
    if (!code.trim()) return notify.warn('Write some code first!')
    dispatch(runCode({ problemId: id, language, code }))
  }, [code, id, language, dispatch, notify])

  const handleSubmit = useCallback(() => {
    if (!code.trim()) return notify.warn('Write some code first!')
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left – Problem description */}
      <div className="w-[38%] min-w-[280px] border-r border-surface-200 overflow-hidden flex-shrink-0">
        <ProblemPanel problem={problem} loading={loading} />
      </div>

      {/* Right – Editor + Output */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor takes most space */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            problemId={id}
            language={language}
            onLangChange={handleLangChange}
            code={code}
            onCodeChange={setCode}
          />
        </div>

        {/* Output panel – fixed height */}
        <div className="h-64 border-t border-surface-200 flex-shrink-0 overflow-hidden">
          <OutputPanel problem={problem} onRun={handleRun} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

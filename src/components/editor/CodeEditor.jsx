import { useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useSelector, useDispatch } from 'react-redux'
import { setEditorPrefs } from '../../features/ui/uiSlice'
import { LANGUAGES, saveCode } from '../../utils/editorUtils'
import { Spinner } from '../ui'
import { Copy, RotateCcw, Minus, Plus } from 'lucide-react'

export default function CodeEditor({ problemId, language, onLangChange, code, onCodeChange }) {
  const dispatch      = useDispatch()
  const editorRef     = useRef(null)
  const { editorPrefs } = useSelector(s => s.ui)

  const handleChange = useCallback((val = '') => {
    onCodeChange(val)
    saveCode(problemId, language, val)
  }, [onCodeChange, problemId, language])

  const handleMount = (editor) => { editorRef.current = editor }

  const handleLangChange = (e) => {
    onLangChange(e.target.value)
  }

  const copyCode  = () => navigator.clipboard.writeText(code ?? '')
  const resetCode = () => {
    const tpl = TEMPLATES[language] ?? ''
    onCodeChange(tpl)
    saveCode(problemId, language, tpl)
  }

  const selectedLang = LANGUAGES.find(l => l.id === language) ?? LANGUAGES[0]

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        {/* Language select */}
        <select
          value={language}
          onChange={handleLangChange}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500 font-mono cursor-pointer"
        >
          {LANGUAGES.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={() => dispatch(setEditorPrefs({ fontSize: Math.max(10, editorPrefs.fontSize - 1) }))} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Decrease font">
            <Minus size={12} />
          </button>
          <span className="text-slate-500 text-xs font-mono w-5 text-center">{editorPrefs.fontSize}</span>
          <button onClick={() => dispatch(setEditorPrefs({ fontSize: Math.min(24, editorPrefs.fontSize + 1) }))} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Increase font">
            <Plus size={12} />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button onClick={copyCode} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Copy code">
            <Copy size={13} />
          </button>
          <button onClick={resetCode} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Reset to template">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Monaco */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={selectedLang.monaco}
          value={code}
          onChange={handleChange}
          onMount={handleMount}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full bg-slate-950">
              <Spinner size="lg" />
            </div>
          }
          options={{
            fontSize:               editorPrefs.fontSize,
            tabSize:                editorPrefs.tabSize,
            minimap:                { enabled: editorPrefs.minimap },
            scrollBeyondLastLine:   false,
            automaticLayout:        true,
            fontFamily:             "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures:          true,
            cursorBlinking:         'smooth',
            smoothScrolling:        true,
            padding:                { top: 12, bottom: 12 },
            lineNumbersMinChars:    3,
            bracketPairColorization:{ enabled: true },
            renderLineHighlight:    'gutter',
            wordWrap:               'on',
          }}
        />
      </div>
    </div>
  )
}

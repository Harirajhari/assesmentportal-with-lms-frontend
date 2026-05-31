export const LANGUAGES = [
  { id: 'python',     label: 'Python 3',   monaco: 'python'     },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'java',       label: 'Java',       monaco: 'java'       },
  { id: 'cpp',        label: 'C++',        monaco: 'cpp'        },
  { id: 'c',          label: 'C',          monaco: 'c'          },
  { id: 'go',         label: 'Go',         monaco: 'go'         },
  { id: 'rust',       label: 'Rust',       monaco: 'rust'       },
]

// Default templates — used only when problem has no starter code for a language
export const TEMPLATES = {
  python:     `# Write your code here\n`,
  javascript: `// Write your code here\n`,
  java:       `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`,
  c:          `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`,
  go:         `package main\n\nfunc main() {\n    // Write your code here\n}\n`,
  rust:       `fn main() {\n    // Write your code here\n}\n`,
}

const key = (problemId, lang) => `code:${problemId}:${lang}`

/**
 * Load code for a problem + language with this priority:
 *   1. User's saved code in localStorage  (they already started typing)
 *   2. Problem's starterCode[lang]         (non-empty string set by admin)
 *   3. Default TEMPLATES[lang]             (fallback generic main stub)
 *
 * @param {string} problemId
 * @param {string} lang
 * @param {object} starterCode  — problem.starterCode object, e.g. { python: '...', java: '...' }
 */
export function loadCode(problemId, lang, starterCode = {}) {
  // 1. Check localStorage first — user may have already edited
  if (problemId) {
    try {
      const saved = localStorage.getItem(key(problemId, lang))
      if (saved) return saved
    } catch { /* ignore */ }
  }

  // 2. Use problem's starter code if non-empty
  const starter = starterCode?.[lang]
  if (starter && starter.trim()) return starter

  // 3. Fall back to generic template
  return TEMPLATES[lang] ?? ''
}

/**
 * Persist user's code. Clears storage if code matches starter/template (no point saving defaults).
 */
export function saveCode(problemId, lang, code, starterCode = {}) {
  if (!problemId) return
  try {
    const base = starterCode?.[lang]?.trim() || (TEMPLATES[lang] ?? '').trim()
    if (!code || code.trim() === base) {
      localStorage.removeItem(key(problemId, lang))
    } else {
      localStorage.setItem(key(problemId, lang), code)
    }
  } catch { /* ignore */ }
}

/**
 * Clear all saved code for a problem (e.g. after reset).
 */
export function clearCode(problemId) {
  if (!problemId) return
  try {
    LANGUAGES.forEach(({ id }) => localStorage.removeItem(key(problemId, id)))
  } catch { /* ignore */ }
}
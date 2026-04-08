// ── Supported languages (must match backend judge0.js language IDs) ───────────
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'python',     label: 'Python 3',   monaco: 'python'     },
  { id: 'java',       label: 'Java',       monaco: 'java'       },
  { id: 'cpp',        label: 'C++',        monaco: 'cpp'        },
  { id: 'c',          label: 'C',          monaco: 'c'          },
  { id: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { id: 'go',         label: 'Go',         monaco: 'go'         },
  { id: 'rust',       label: 'Rust',       monaco: 'rust'       },
]

// ── Default starter templates ────────────────────────────────────────────────
export const TEMPLATES = {
  javascript: `// JavaScript solution\nfunction solution() {\n  const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n  // your code here\n}\nsolution();\n`,
  python:     `# Python 3 solution\nimport sys\ninput = sys.stdin.readline\n\ndef solve():\n    # your code here\n    pass\n\nsolve()\n`,
  java:       `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // your code here\n    }\n}\n`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // your code here\n    return 0;\n}\n`,
  c:          `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // your code here\n    return 0;\n}\n`,
  typescript: `// TypeScript solution\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n// your code here\n`,
  go:         `package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    _ = reader\n    // your code here\n    fmt.Println()\n}\n`,
  rust:       `use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    for line in stdin.lock().lines() {\n        let _line = line.unwrap();\n        // your code here\n    }\n}\n`,
}

// ── localStorage auto-save ───────────────────────────────────────────────────
const KEY = (pid, lang) => `cp_code_${pid}_${lang}`

export const loadCode = (pid, lang) => {
  if (!pid) return TEMPLATES[lang] ?? ''
  try { return localStorage.getItem(KEY(pid, lang)) ?? TEMPLATES[lang] ?? '' }
  catch { return TEMPLATES[lang] ?? '' }
}

export const saveCode = (pid, lang, code) => {
  if (!pid) return
  try { localStorage.setItem(KEY(pid, lang), code) } catch { /* quota */ }
}

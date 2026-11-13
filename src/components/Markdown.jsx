import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

/**
 * Models sometimes write math as \( ... \) and \[ ... \]. Convert those to the
 * $ ... $ / $$ ... $$ form that remark-math understands.
 */
function normalizeMath(text) {
  return String(text || '')
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n$$\n${m.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m.trim()}$`)
}

const components = {
  // Wide tables scroll inside the bubble instead of stretching the page.
  table: ({ node: _node, ...props }) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
}

const remarkPlugins = [remarkGfm, remarkMath]
const rehypePlugins = [[rehypeKatex, { throwOnError: false, strict: false }]]

/** Markdown with GitHub tables and KaTeX math. */
function Markdown({ children, className = '' }) {
  return (
    <div className={`md ${className}`}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {normalizeMath(children)}
      </ReactMarkdown>
    </div>
  )
}

export default memo(Markdown)

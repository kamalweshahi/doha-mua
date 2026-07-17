import './Markdown.css'

export default function Markdown({ text }: { text: string }) {
  return (
    <div className="markdown">
      {text.split('\n').map((line, index) => {
        const trimmedLine = line.trim()

        if (!trimmedLine || trimmedLine === '---') {
          return null
        }

        if (trimmedLine.startsWith('# ')) {
          return (
            <h1 key={index}>
              {trimmedLine.replace(/^#\s+/, '')}
            </h1>
          )
        }

        if (trimmedLine.startsWith('## ')) {
          return (
            <h2 key={index}>
              {trimmedLine.replace(/^##\s+/, '')}
            </h2>
          )
        }

        const activityMatch = trimmedLine.match(
          /^-\s+\*\*(.+?):\*\*\s*(.*)$/
        )

        if (activityMatch) {
          const [, label, description] = activityMatch

          return (
            <div className="itinerary-item" key={index}>
              <strong>{label}</strong>
              <span>{description}</span>
            </div>
          )
        }

        if (trimmedLine.startsWith('- ')) {
          return (
            <div className="travel-tip" key={index}>
              <span className="travel-tip-dot" />
              <span>{trimmedLine.replace(/^-\s+/, '')}</span>
            </div>
          )
        }

        if (
          trimmedLine.startsWith('**') &&
          trimmedLine.endsWith('**')
        ) {
          return (
            <h3 key={index}>
              {trimmedLine.replaceAll('**', '')}
            </h3>
          )
        }

        return <p key={index}>{trimmedLine}</p>
      })}
    </div>
  )
}

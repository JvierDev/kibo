import { useState, useEffect } from 'react'

function Versions(): React.JSX.Element {
  const [versions, setVersions] = useState<{ electron: string; chrome: string; node: string }>({
    electron: '',
    chrome: '',
    node: ''
  })

  useEffect(() => {
    if (window.electron?.process) {
      setVersions({
        electron: window.electron.process.versions.electron ?? '',
        chrome: window.electron.process.versions.chrome ?? '',
        node: window.electron.process.versions.node ?? ''
      })
    }
  }, [])

  return (
    <ul className="versions">
      <li>
        Electron <code>{versions.electron}</code>
      </li>
      <li>
        Chromium <code>{versions.chrome}</code>
      </li>
      <li>
        Node <code>{versions.node}</code>
      </li>
    </ul>
  )
}

export default Versions
import { useState } from 'react'

const useResponsiveView = () => {
  const [view, setView] = useState('grid')

  return [view, setView]
}

export default useResponsiveView

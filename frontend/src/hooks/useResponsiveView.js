import { useState } from 'react'

const useResponsiveView = () => {
  const [view, setView] = useState('card')

  return [view, setView]
}

export default useResponsiveView

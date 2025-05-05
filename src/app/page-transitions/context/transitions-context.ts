import { type Dispatch, type SetStateAction, createContext } from 'react'
import type { FlowType } from '../types/flow-type'

interface TransitionsContext {
  flowType: React.MutableRefObject<FlowType | null>
  className: string
  setClassName: Dispatch<SetStateAction<string>>
  animationDuration: number
}

const TransitionsContext = createContext<TransitionsContext | null>(null)

export { TransitionsContext }

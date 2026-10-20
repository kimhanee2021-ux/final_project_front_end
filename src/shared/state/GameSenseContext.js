import { createContext, useContext } from 'react'
export const GameSenseContext = createContext(null)
export const useGameSense = () => useContext(GameSenseContext)

import { useState } from 'react'
import { PcSpecContext } from './PcSpecContext'
import PcSpecDialog from '../components/spec/PcSpecDialog'
import { EMPTY_SPECS, SPEC_FIELDS, hasSpecs } from '../model/pcSpecs'

const STORAGE_KEY = 'gamesense-pc-specs'
const EMPTY_SAVED = { specs: EMPTY_SPECS, detail: null, aiConsent: false }

// 저장된 값은 사양 칸 4개에, 사진 상세(detail)와 AI 분석 동의(aiConsent)를 함께 둔 객체다.
function readSaved() {
  try {
    const {
      detail = null,
      aiConsent = false,
      ...fields
    } = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? {}
    const specs = Object.fromEntries(SPEC_FIELDS.map(({ key }) => [key, String(fields[key] ?? '')]))
    return { specs, detail, aiConsent }
  } catch {
    return EMPTY_SAVED
  }
}

// 입력한 PC 사양을 브라우저(localStorage)에 저장하고, 사양 입력 창을 한 곳에서만 그린다.
// 어느 화면의 버튼이든 openSpecDialog()를 부르면 같은 창이 그 자리에서 열린다.
export default function PcSpecProvider({ children }) {
  const [saved, setSaved] = useState(readSaved)
  const [dialogOpen, setDialogOpen] = useState(false)

  const persist = next => {
    setSaved(next)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...next.specs, detail: next.detail, aiConsent: next.aiConsent })
      )
    } catch {
      /* 저장소를 못 써도 이번 화면에서는 입력값을 계속 쓴다. */
    }
  }
  const saveSpecs = (specs, { detail = null, aiConsent = false } = {}) => persist({ specs, detail, aiConsent })
  const resetSpecs = () => persist(EMPTY_SAVED)

  const value = {
    specs: saved.specs,
    detail: saved.detail,
    aiConsent: saved.aiConsent,
    hasSavedSpecs: hasSpecs(saved.specs),
    saveSpecs,
    resetSpecs,
    openSpecDialog: () => setDialogOpen(true),
  }

  return (
    <PcSpecContext.Provider value={value}>
      {children}
      <PcSpecDialog
        open={dialogOpen}
        saved={saved}
        onSave={saveSpecs}
        onReset={resetSpecs}
        onClose={() => setDialogOpen(false)}
      />
    </PcSpecContext.Provider>
  )
}

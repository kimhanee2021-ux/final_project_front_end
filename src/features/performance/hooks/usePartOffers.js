import { useEffect, useRef, useState } from 'react'
import { loadPcParts } from '../api'

// 부품 시세 목록. reload를 부르면 이전 요청을 끊고 새로 받아오며, 늦게 도착한 이전 응답은 버린다.
export function usePartOffers() {
  const [partOffers, setPartOffers] = useState([]),
    [partsLoading, setPartsLoading] = useState(false)
  const controller = useRef(null),
    sequence = useRef(0)
  useEffect(
    () => () => {
      sequence.current++
      controller.current?.abort()
    },
    []
  )
  function reload() {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    const id = ++sequence.current
    setPartOffers([])
    setPartsLoading(true)
    const timer = setTimeout(() => request.abort(), 150000)
    loadPcParts(request.signal)
      .then(offers => {
        if (sequence.current === id) setPartOffers(Array.isArray(offers) ? offers : [])
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        if (sequence.current === id) setPartsLoading(false)
      })
  }
  return { partOffers, partsLoading, reload }
}

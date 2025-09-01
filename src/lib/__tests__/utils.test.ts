import { formatTime, generateId, calculateFocusScore, minutesToSeconds, secondsToMinutes, cn } from '../utils'

describe('Utils Tests', () => {
  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(60)).toBe('01:00')
    expect(formatTime(125)).toBe('02:05')
  })

  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
  })

  it('should calculate focus score', () => {
    expect(calculateFocusScore(25, 25)).toBe(100)
    expect(calculateFocusScore(20, 25)).toBe(80)
    expect(calculateFocusScore(0, 25)).toBe(0)
    expect(calculateFocusScore(10, 0)).toBe(0)
  })

  it('should convert minutes to seconds', () => {
    expect(minutesToSeconds(1)).toBe(60)
    expect(minutesToSeconds(2.5)).toBe(150)
  })

  it('should convert seconds to minutes', () => {
    expect(secondsToMinutes(60)).toBe(1)
    expect(secondsToMinutes(150)).toBe(2)
  })

  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toContain('class1')
  })
})

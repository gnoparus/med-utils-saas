import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Numpad } from '../../src/components/ui/Numpad'
import { HapticSlider } from '../../src/components/ui/HapticSlider'

describe('UI components', () => {
  it('Numpad calls handlers when keys pressed and back/next invoked', () => {
    const pressed: string[] = []
    const onBack = vi.fn()
    const onNext = vi.fn()

    const { container } = render(
      <Numpad
        onKeyPress={(k) => pressed.push(k)}
        onBackspace={onBack}
        onNext={onNext}
        nextLabel="Next"
      />
    )

    // Press a couple of digit keys
    const btn1 = screen.getByText('1')
    fireEvent.click(btn1)
    const btnDot = screen.getByText('.')
    fireEvent.click(btnDot)

    // Find the delete button (it contains an SVG icon and has no digit text)
    const allButtons = Array.from(container.querySelectorAll('button'))
    const deleteBtn = allButtons.find(b => !!b.querySelector('svg') && (b.textContent || '').trim().length === 0)
    expect(deleteBtn).toBeTruthy()
    if (deleteBtn) fireEvent.click(deleteBtn)

    // Click the Next button
    const nextBtn = screen.getByText('Next')
    fireEvent.click(nextBtn)

    expect(pressed).toContain('1')
    expect(pressed).toContain('.')
    expect(onBack).toHaveBeenCalled()
    expect(onNext).toHaveBeenCalled()
  })

  it('HapticSlider renders and calls onChange when range value changes', () => {
    const onChange = vi.fn()

    const { container } = render(
      <HapticSlider
        min={0}
        max={10}
        value={5}
        onChange={onChange}
        label="Test Slider"
        unit="kg"
      />
    )

    const input = container.querySelector('input[type="range"]') as HTMLInputElement | null
    expect(input).toBeTruthy()

    if (input) {
      // Change value — component calls onChange with a number
      fireEvent.change(input, { target: { value: '7' } })
      expect(onChange).toHaveBeenCalled()
      // assert called with numeric value (7)
      const calledWithNumber = onChange.mock.calls.some(call => call[0] === 7 || call[0] === 7.0)
      expect(calledWithNumber).toBe(true)
    }
  })
})

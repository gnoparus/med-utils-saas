import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Numpad } from '../../src/components/ui/Numpad'

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
        accentClassName="bg-orange-500/10 border-orange-500/30 text-orange-400 active:bg-orange-500/20"
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
})

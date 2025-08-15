import { render, screen } from '@testing-library/react'
import App from './App'
import { expect } from 'vitest'

test('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText(/student login/i)).toBeInTheDocument()
})
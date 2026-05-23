import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

describe('GTA Vice City Guide App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders standard layout elements (Audio button, Progress bar, Title)', () => {
    render(<App />);

    // Mute/Audio toggle button is visible
    const audioBtn = screen.getByTitle(/Mute Sound FX|Enable Sound FX/i);
    expect(audioBtn).toBeInTheDocument();

    // Progress counter shows page 1
    expect(screen.getByText(/PAGE 01/i)).toBeInTheDocument();
  });

  it('renders the Hero Scene on first load and transitions on button click', () => {
    render(<App />);

    // Verify hero text
    expect(screen.getByText('GRAND THEFT AUTO')).toBeInTheDocument();
    expect(screen.getByText('Vice City')).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /ESTABLISH CONNECTION/i });
    expect(startBtn).toBeInTheDocument();

    // Click to start navigation
    fireEvent.click(startBtn);

    // Fast-forward animation timer
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Verify it transitioned to Criminal Intel (page 2 / Scene 1)
    expect(screen.getByText(/PAGE 02/i)).toBeInTheDocument();
    expect(screen.getByText('Criminal Intel')).toBeInTheDocument();
  });

  it('toggles the audio mute button state', () => {
    render(<App />);

    const audioBtn = screen.getByTitle(/Mute Sound FX/i);
    expect(audioBtn).toBeInTheDocument();
    expect(screen.getByText('AUDIO: ON')).toBeInTheDocument();

    // Click mute
    fireEvent.click(audioBtn);

    // Now button acts as enable mute, text shows muted
    expect(screen.getByTitle(/Enable Sound FX/i)).toBeInTheDocument();
    expect(screen.getByText('AUDIO: OFF')).toBeInTheDocument();
  });

  it('moves through scenes using navigation buttons', () => {
    render(<App />);

    const nextBtn = screen.getByTitle(/Next Scene/i);
    const prevBtn = screen.getByTitle(/Previous Scene/i);

    expect(prevBtn).toBeDisabled(); // Cannot go back from scene 1
    expect(nextBtn).toBeEnabled();

    // Advance to Scene 2 (Criminal Intel)
    fireEvent.click(nextBtn);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(/PAGE 02/i)).toBeInTheDocument();
    expect(prevBtn).toBeEnabled(); // Now we can go back

    // Advance to Scene 3 (Gangs)
    fireEvent.click(nextBtn);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(/PAGE 03/i)).toBeInTheDocument();

    // Go back to Scene 2
    fireEvent.click(prevBtn);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(/PAGE 02/i)).toBeInTheDocument();
  });

  it('shows low data mode message if connection saveData is true', () => {
    // Mock navigator.connection.saveData as true
    const originalConnection = (navigator as any).connection;
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        saveData: true,
        effectiveType: '3g',
      },
    });

    render(<App />);

    expect(screen.getByText(/Low data mode enabled/i)).toBeInTheDocument();

    // Reset navigator connection configuration
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: originalConnection,
    });
  });
});

import { HotkeyRecorder } from '@components/SettingsModal/HotkeyRecorder';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('HotkeyRecorder Component', () => {
  it('renders with initial value', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="Ctrl+Shift+A" onChange={onChange} />);
    expect(screen.getByText('Ctrl+Shift+A')).toBeInTheDocument();
  });

  it('renders placeholder when empty', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="" onChange={onChange} placeholder="Press keys..." />);
    expect(screen.getByText('Press keys...')).toBeInTheDocument();
  });

  it('enters recording mode on click', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="Ctrl+A" onChange={onChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // "Ctrl+A" should be replaced by "Press keys..." (default placeholder for recording empty set)
    expect(screen.getByText('Press keys...')).toBeInTheDocument();
  });

  it('records a standard hotkey (Ctrl+K)', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    // Sequence: Press Control -> Press K -> Release K (trigger) or Release Control (trigger)
    // The component logic triggers in handleKeyUp if a valid combo exists.

    // Press Control
    fireEvent.keyDown(window, { key: 'Control', ctrlKey: true });
    // Press k
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    // Release k - should trigger because we have modifier (Ctrl) + non-modifier (k)
    fireEvent.keyUp(window, { key: 'k', ctrlKey: true });

    expect(onChange).toHaveBeenCalledWith('Ctrl+K');
  });

  it('records a complex hotkey (Ctrl+Shift+Alt+L)', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    fireEvent.keyDown(window, { key: 'Control', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'Shift', ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(window, { key: 'Alt', ctrlKey: true, shiftKey: true, altKey: true });
    fireEvent.keyDown(window, { key: 'l', ctrlKey: true, shiftKey: true, altKey: true });

    fireEvent.keyUp(window, { key: 'l', ctrlKey: true, shiftKey: true, altKey: true });

    expect(onChange).toHaveBeenCalledWith('Ctrl+Alt+Shift+L');
  });

  it('handles F-keys without modifiers', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    fireEvent.keyDown(window, { key: 'F5' });
    fireEvent.keyUp(window, { key: 'F5' });

    expect(onChange).toHaveBeenCalledWith('F5');
  });

  it('ignores single letters without modifiers', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyUp(window, { key: 'a' });

    expect(onChange).not.toHaveBeenCalled();
    // Should still be recording
    expect(screen.getByText('Press keys...')).toBeInTheDocument();
  });

  it('stops recording on blur', () => {
    const onChange = vi.fn();
    render(<HotkeyRecorder value="Ctrl+A" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Press keys...')).toBeInTheDocument();

    fireEvent.blur(window);

    // Should revert to original value display because recording was cancelled without selection
    expect(screen.getByText('Ctrl+A')).toBeInTheDocument();
  });
});

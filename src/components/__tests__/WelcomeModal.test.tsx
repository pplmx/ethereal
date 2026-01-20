import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../../stores/settingsStore';
import { WelcomeModal } from '../WelcomeModal';

vi.mock('../../stores/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}));

describe('WelcomeModal', () => {
  const updateConfigMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSettingsStore as any).mockReturnValue({
      config: {
        general: { first_launch: true },
      },
      updateConfig: updateConfigMock,
    });
  });

  it('renders when first_launch is true', () => {
    render(<WelcomeModal />);
    expect(screen.getAllByText('Awaken the Spirit').length).toBeGreaterThan(0);
  });

  it('does not render when first_launch is false', () => {
    (useSettingsStore as any).mockReturnValue({
      config: {
        general: { first_launch: false },
      },
      updateConfig: updateConfigMock,
    });

    render(<WelcomeModal />);
    expect(screen.queryByText('Awaken the Spirit')).toBeNull();
  });

  it('calls updateConfig and closes on button click', async () => {
    render(<WelcomeModal />);

    // The button is the one with the uppercase class or we can find by role
    const button = screen.getByRole('button', { name: /Awaken the Spirit/i });
    fireEvent.click(button);

    expect(updateConfigMock).toHaveBeenCalledWith(
      expect.objectContaining({
        general: { first_launch: false },
      }),
    );
  });
});

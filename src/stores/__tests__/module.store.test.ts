import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useModuleStore } from '../module.store';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}));

describe('moduleStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useModuleStore.setState({
      modules: {
        clinic: true,
        monitoring: false,
        inpatient: false,
        grooming: false,
        petshop: false,
        inventory: false,
        accounting: false,
        website: false,
      },
      isLoading: false,
      error: null,
    });
  });

  it('initializes with default modules', () => {
    const state = useModuleStore.getState();
    expect(state.modules.clinic).toBe(true);
    expect(state.modules.monitoring).toBe(false);
  });

  it('setModules updates modules', () => {
    useModuleStore.getState().setModules({
      clinic: false,
      monitoring: true,
      inpatient: false,
      grooming: false,
      petshop: false,
      inventory: false,
      accounting: false,
      website: false,
    });
    const state = useModuleStore.getState();
    expect(state.modules.clinic).toBe(false);
    expect(state.modules.monitoring).toBe(true);
  });

  it('setLoading updates loading state', () => {
    useModuleStore.getState().setLoading(true);
    expect(useModuleStore.getState().isLoading).toBe(true);
  });

  it('setError updates error state', () => {
    useModuleStore.getState().setError('Test error');
    expect(useModuleStore.getState().error).toBe('Test error');
  });

  it('fetchModuleStatus loads modules from supabase', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      data: [
        { key: 'clinic', is_enabled: true },
        { key: 'monitoring', is_enabled: true },
        { key: 'inventory', is_enabled: true },
      ],
      error: null,
    });

    mockFrom.mockReturnValue({ select: mockSelect });

    await useModuleStore.getState().fetchModuleStatus();
    const state = useModuleStore.getState();
    expect(state.modules.monitoring).toBe(true);
    expect(state.modules.inventory).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('fetchModuleStatus handles error', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      data: null,
      error: { message: 'DB Error' },
    });

    mockFrom.mockReturnValue({ select: mockSelect });

    await useModuleStore.getState().fetchModuleStatus();
    const state = useModuleStore.getState();
    expect(state.error).toBe('DB Error');
    expect(state.isLoading).toBe(false);
  });
});
# Rule Catalog — Business Logic

## State management consistency

IsUrgent: True
Category: Business Logic

### Description

Ensure consistent state management patterns across the application. Use the same approach for similar functionality and encapsulate complex state logic in custom hooks.

Wrong:

```tsx
// Inconsistent state management
const [localState, setLocalState] = useState(initialValue);
const globalState = useContext(GlobalStateContext);
```

Right:

```tsx
// Consistent state management
const { state, dispatch } = useEtherealState(); // Custom hook for consistent state management
```

## Tauri command naming convention

IsUrgent: True
Category: Business Logic

### Description

Use consistent naming conventions for Tauri commands. Follow snake_case for all Tauri command names.

Wrong:

```tsx
invoke('getGpuStats');
invoke('setClickThrough');
```

Right:

```tsx
invoke('get_gpu_stats');
invoke('set_click_through');
```

## Event naming consistency

IsUrgent: True
Category: Business Logic

### Description

Use consistent naming for Tauri events. Follow kebab-case for all Tauri event names.

Wrong:

```tsx
emit('GPU_UPDATE');
emit('windowUpdate');
```

Right:

```tsx
emit('gpu-update');
emit('window-update');
```

## Business logic separation

IsUrgent: False
Category: Business Logic

### Description

Separate business logic from UI components. Use hooks or utility functions to encapsulate complex logic.

Wrong:

```tsx
// Business logic mixed with UI
const handleStateTransition = (gpuTemp: number, activity: string) => {
  if (gpuTemp > 80) return 'OVERHEATING';
  if (activity === 'CODING') return 'CODING';
  if (activity === 'GAMING') return 'GAMING';
  return 'IDLE';
};
```

Right:

```tsx
// Business logic encapsulated
const etherealState = useEtherealState(); // Encapsulates all state transition logic
```

## Error state handling

IsUrgent: True
Category: Business Logic

### Description

Handle error states properly in business logic. Always provide fallback behavior for failed operations.

Wrong:

```tsx
// No error handling
const gpuStats = await invoke<GpuStats>('get_gpu_stats');
```

Right:

```tsx
// Proper error handling
try {
  const gpuStats = await invoke<GpuStats>('get_gpu_stats');
  // Handle success
} catch (error) {
  // Handle error state
  setErrorMessage('Failed to retrieve GPU stats');
}
```

# Rule Catalog — Code Quality

## Conditional class names use utility function

IsUrgent: True
Category: Code Quality

### Description

Ensure conditional CSS is handled via the shared `cn` utility instead of custom ternaries, string concatenation, or template strings. Centralizing class logic keeps components consistent and easier to maintain.

### Suggested Fix

```ts
import { cn } from '@/utils/classnames'
const classNames = cn(isActive ? 'text-primary-600' : 'text-gray-500')
```

## Tailwind-first styling

IsUrgent: True
Category: Code Quality

### Description

Favor Tailwind CSS utility classes instead of adding new CSS files unless a Tailwind combination cannot achieve the required styling. Keeping styles in Tailwind improves consistency and reduces maintenance overhead.

## Classname ordering for easy overrides

### Description

When writing components, always place the incoming `className` prop after the component's own class values so that downstream consumers can override or extend the styling. This keeps your component's defaults but still lets external callers change or remove specific styles.

Example:

```tsx
import { cn } from '@/utils/classnames'

const Button = ({ className }) => {
  return <div className={cn('bg-blue-500', className)}></div>
}
```

## Tauri API error handling

IsUrgent: True
Category: Code Quality

### Description

Always handle Tauri API errors properly with try/catch blocks. Never assume Tauri commands will always succeed.

### Suggested Fix

```ts
try {
  const result = await invoke('some_command', { param: value });
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error('Command failed:', error);
}
```

## Inline anonymous functions in render

IsUrgent: False
Category: Code Quality

### Description

Avoid creating anonymous functions in render methods. Use `useCallback` for event handlers to prevent unnecessary re-renders.

### Suggested Fix

```ts
// ❌ Avoid
<button onClick={() => handleClick(param)}>Click me</button>

// ✅ Prefer
const handleButtonClick = useCallback(() => {
  handleClick(param);
}, [param, handleClick]);

<button onClick={handleButtonClick}>Click me</button>
```

## Hardcoded strings in UI

IsUrgent: False
Category: Code Quality

### Description

Avoid hardcoded strings in UI. Use constants or localization functions for better maintainability.

### Suggested Fix

```ts
// ❌ Avoid
<h1>Loading...</h1>

// ✅ Prefer
<h1>{t('common.loading')}</h1>
// or
<h1>{CONSTANTS.LOADING_TEXT}</h1>
```

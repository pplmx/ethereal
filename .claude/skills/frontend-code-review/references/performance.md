# Rule Catalog — Performance

## React Flow data usage

IsUrgent: True
Category: Performance

### Description

When rendering React Flow, prefer `useNodes`/`useEdges` for UI consumption and rely on `useStoreApi` inside callbacks that mutate or read node/edge state. Avoid manually pulling Flow data outside of these hooks.

## Complex prop memoization

IsUrgent: True
Category: Performance

### Description

Wrap complex prop values (objects, arrays, maps) in `useMemo` prior to passing them into child components to guarantee stable references and prevent unnecessary renders.

Wrong:

```tsx
<HeavyComp
    config={{
        provider: ...,
        detail: ...
    }}
/>
```

Right:

```tsx
const config = useMemo(() => ({
    provider: ...,
    detail: ...
}), [provider, detail]);

<HeavyComp
    config={config}
/>
```

## Tauri event listener cleanup

IsUrgent: True
Category: Performance

### Description

Always clean up Tauri event listeners to prevent memory leaks. Use the unlisten function returned by the listen method.

Wrong:

```tsx
useEffect(() => {
  listen('gpu-update', (event) => {
    // Handle event
  });
}, []);
```

Right:

```tsx
useEffect(() => {
  const unlisten = listen('gpu-update', (event) => {
    // Handle event
  });

  return () => {
    unlisten.then(f => f());
  };
}, []);
```

## Excessive state updates

IsUrgent: False
Category: Performance

### Description

Avoid unnecessary state updates that trigger re-renders. Use functional updates when the new state depends on the previous state.

Wrong:

```tsx
const [count, setCount] = useState(0);
const increment = () => {
  setCount(count + 1);
  setCount(count + 1); // Triggers two re-renders
};
```

Right:

```tsx
const [count, setCount] = useState(0);
const increment = () => {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1); // Properly increments by 2 with one re-render
};
```

## Large object comparisons

IsUrgent: False
Category: Performance

### Description

When comparing large objects, use deep equality checks or memoization to prevent unnecessary re-renders.

Wrong:

```tsx
useEffect(() => {
  // Expensive operation on largeObject
}, [largeObject]); // Triggers on every render if largeObject is recreated
```

Right:

```tsx
const memoizedObject = useMemo(() => largeObject, [dependency]);
useEffect(() => {
  // Expensive operation on memoizedObject
}, [memoizedObject]);
```
# `useVRM`

The `useVRM` hook for displaying [VRM](https://vrm.dev/en/) models. Powered by
[react-three-fiber](https://github.com/pmndrs/react-three-fiber) and
[pixiv/three-vrm](https://github.com/pixiv/three-vrm)

> [!NOTE] Semantic Versioning may not be followed for 0.x releases until
> reaching a stable state.

## Usage

```tsx
import { Suspense } from "react";
import { useVRM } from "use-vrm";

function Model() {
  const { vrm } = useVRM("./example.vrm", "./idle.vrma");

  // loading is handled via suspend-react
  return <primitive object={vrm.scene} />;
}

function App() {
  return (
    <Suspense fallback={<FallbackComponent /> /* or null */}>
      <Model />
    </Suspense>
  );
}
```

## Example

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/yue4u/libvrm/tree/main/examples?file=use-vrm/App.tsx&startScript=start:use-vrm)

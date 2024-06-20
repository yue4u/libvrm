# `<vrm-viewer>`

The <vrm-viewer /> web component for displaying [VRM](https://vrm.dev/en/) models. Powered by [model-viewer](https://modelviewer.dev/) and [pixiv/three-vrm](https://github.com/pixiv/three-vrm)

> [!NOTE]
> Semantic Versioning may not be followed for 0.x releases until reaching a stable state.

## Usage

```html
<vrm-viewer 
    camera-controls touch-action="pan-y" tone-mapping="neutral"
    src="./example.vrm" vrmaSrc="./idle.vrma"
/>
<script type="module" src="vrm-viewer.min.js"></script>
```

## Example

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/yue4u/libvrm/examples)
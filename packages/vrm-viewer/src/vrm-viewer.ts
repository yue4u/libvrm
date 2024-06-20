import { VRMMixin } from "./features/vrm-mixin";
import { ModelViewerElement } from "@google/model-viewer/src/model-viewer";

export const VRMViewerElement = VRMMixin(ModelViewerElement);
customElements.define("vrm-viewer", VRMViewerElement);

export type VRMViewerElement = InstanceType<typeof VRMViewerElement>;

declare global {
  interface HTMLElementTagNameMap {
    "vrm-viewer": VRMViewerElement;
  }
}

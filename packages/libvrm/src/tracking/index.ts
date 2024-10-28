import { VRM } from "@pixiv/three-vrm";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { applyMediapipeResults } from "./applyMediapipeResults";

export function createTracking({
    cameraCapture,
    getVRM,
    onReady,
}: {
    cameraCapture: HTMLVideoElement;
    getVRM(): VRM | null;
    onReady?(): Promise<void> | void;
}): {
    holistic: Holistic;
    camera: Camera;
} {
    let ready = false;
    let hasWarnVRMVersion = false;
    const holistic = new Holistic({
        locateFile(file) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
        },
    });

    holistic.setOptions({
        modelComplexity: 1,
        selfieMode: true,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        refineFaceLandmarks: true,
    });

    holistic.onResults((results: Results) => {
        const vrm = getVRM();
        if (!vrm) return;
        if (vrm.meta.metaVersion !== "0") {
            if (!hasWarnVRMVersion) {
                console.warn(
                    `VRM version ${vrm.meta.metaVersion} is not supported`,
                );
                hasWarnVRMVersion = true;
            }
            return;
        }

        applyMediapipeResults(cameraCapture, vrm, results);

        if (!ready) {
            ready = true;
            onReady?.();
        }
    });

    const camera = new Camera(cameraCapture, {
        async onFrame() {
            await holistic.send({ image: cameraCapture });
        },
        width: 640,
        height: 480,
    });
    camera.start();

    return {
        holistic,
        camera,
    };
}

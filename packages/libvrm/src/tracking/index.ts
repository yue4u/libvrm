import { VRM } from "@pixiv/three-vrm";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic, Results } from "@mediapipe/holistic";
import { applyMediapipeResults } from "./applyMediapipeResults";

export function createTracking({
    cameraCapture,
    getVRM,
    onReady,
    locateFile,
}: {
    cameraCapture: HTMLVideoElement;
    getVRM(): VRM | null;
    onReady?(): Promise<void> | void;
    locateFile?(path: string, prefix?: string): string;
}): {
    holistic: Holistic;
    camera: Camera;
} {
    let ready = false;
    const holistic = new Holistic({
        locateFile(file, prefix) {
            if (locateFile) return locateFile(file, prefix);
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
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

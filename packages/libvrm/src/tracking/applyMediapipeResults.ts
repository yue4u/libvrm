import {
    VRM,
    VRMExpressionPresetName,
    VRMHumanBoneName,
} from "@pixiv/three-vrm";
import * as THREE from "three";
import type { Results } from "@mediapipe/holistic";
import * as Kalidokit from "kalidokit";
import type { TFace, THand, TPose } from "kalidokit";

const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

let oldLookTarget = new THREE.Euler();

// Adapted from kalidokit.
export function applyMediapipeResults(
    videoElement: HTMLVideoElement,
    vrm: VRM,
    results: Results,
) {
    let riggedPose = null as null | TPose;
    let riggedLeftHand = null as null | THand<"Left">;
    let riggedRightHand = null as null | THand<"Right">;
    let riggedFace = null as null | TFace;

    const faceLandmarks = results.faceLandmarks;
    // @ts-expect-error
    const pose3DLandmarks = results.za;
    const pose2DLandmarks = results.poseLandmarks;

    // reversed
    const leftHandLandmarks = results.rightHandLandmarks;
    const rightHandLandmarks = results.leftHandLandmarks;

    if (faceLandmarks) {
        riggedFace = Kalidokit.Face.solve(faceLandmarks, {
            runtime: "mediapipe",
            video: videoElement,
        })!;
        rigFace(riggedFace);
    }

    if (pose3DLandmarks) {
        riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
            runtime: "mediapipe",
            video: videoElement,
        })!;
        rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
        rigRotation("Chest", riggedPose.Spine, 0.25 * 0.5, 0.3);
        rigRotation("Spine", riggedPose.Spine, 0.45 * 0.5, 0.3);

        rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
        rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
        rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
        rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);
    }

    if (leftHandLandmarks) {
        riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left")!;
        if (riggedPose && riggedLeftHand) {
            rigRotation("LeftHand", {
                z: riggedPose!.LeftHand.z,
                y: riggedLeftHand.LeftWrist.y,
                x: riggedLeftHand.LeftWrist.x,
            });
            rigRotation("LeftRingProximal", riggedLeftHand.LeftRingProximal);
            rigRotation(
                "LeftRingIntermediate",
                riggedLeftHand.LeftRingIntermediate,
            );
            rigRotation("LeftRingDistal", riggedLeftHand.LeftRingDistal);
            rigRotation("LeftIndexProximal", riggedLeftHand.LeftIndexProximal);
            rigRotation(
                "LeftIndexIntermediate",
                riggedLeftHand.LeftIndexIntermediate,
            );
            rigRotation("LeftIndexDistal", riggedLeftHand.LeftIndexDistal);
            rigRotation(
                "LeftMiddleProximal",
                riggedLeftHand.LeftMiddleProximal,
            );
            rigRotation(
                "LeftMiddleIntermediate",
                riggedLeftHand.LeftMiddleIntermediate,
            );
            rigRotation("LeftMiddleDistal", riggedLeftHand.LeftMiddleDistal);
            rigRotation("LeftThumbProximal", riggedLeftHand.LeftThumbProximal);
            rigRotation(
                "LeftThumbMetacarpal",
                riggedLeftHand.LeftThumbIntermediate,
            );
            rigRotation("LeftThumbDistal", riggedLeftHand.LeftThumbDistal);
            rigRotation(
                "LeftLittleProximal",
                riggedLeftHand.LeftLittleProximal,
            );
            rigRotation(
                "LeftLittleIntermediate",
                riggedLeftHand.LeftLittleIntermediate,
            );
            rigRotation("LeftLittleDistal", riggedLeftHand.LeftLittleDistal);
        }
    }

    if (rightHandLandmarks) {
        riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right")!;
        if (riggedPose && riggedLeftHand) {
            rigRotation("RightHand", {
                z: riggedPose.RightHand.z,
                y: riggedRightHand.RightWrist.y,
                x: riggedRightHand.RightWrist.x,
            });
            rigRotation("RightRingProximal", riggedRightHand.RightRingProximal);
            rigRotation(
                "RightRingIntermediate",
                riggedRightHand.RightRingIntermediate,
            );
            rigRotation("RightRingDistal", riggedRightHand.RightRingDistal);
            rigRotation(
                "RightIndexProximal",
                riggedRightHand.RightIndexProximal,
            );
            rigRotation(
                "RightIndexIntermediate",
                riggedRightHand.RightIndexIntermediate,
            );
            rigRotation("RightIndexDistal", riggedRightHand.RightIndexDistal);
            rigRotation(
                "RightMiddleProximal",
                riggedRightHand.RightMiddleProximal,
            );
            rigRotation(
                "RightMiddleIntermediate",
                riggedRightHand.RightMiddleIntermediate,
            );
            rigRotation("RightMiddleDistal", riggedRightHand.RightMiddleDistal);
            rigRotation(
                "RightThumbProximal",
                riggedRightHand.RightThumbProximal,
            );
            rigRotation(
                "RightThumbMetacarpal",
                riggedRightHand.RightThumbIntermediate,
            );
            rigRotation("RightThumbDistal", riggedRightHand.RightThumbDistal);
            rigRotation(
                "RightLittleProximal",
                riggedRightHand.RightLittleProximal,
            );
            rigRotation(
                "RightLittleIntermediate",
                riggedRightHand.RightLittleIntermediate,
            );
            rigRotation("RightLittleDistal", riggedRightHand.RightLittleDistal);
        }
    }

    function rigRotation(
        name: keyof typeof VRMHumanBoneName,
        rotation = { x: 0, y: 0, z: 0 },
        dampener = 1,
        lerpAmount = 0.5,
    ) {
        const Part = vrm.humanoid.getNormalizedBone(
            VRMHumanBoneName[name],
        );
        if (!Part) {
            return;
        }

        if (vrm.meta.metaVersion === "1") {
            rotation.z = -rotation.z;
            rotation.x = -rotation.x;
        }

        let euler = new THREE.Euler(
            rotation.x * dampener,
            rotation.y * dampener,
            rotation.z * dampener,
        );
        let quaternion = new THREE.Quaternion().setFromEuler(euler);
        Part.node.quaternion.slerp(quaternion, lerpAmount);
    }

    function rigFace(riggedFace: any) {
        rigRotation("Neck", riggedFace.head, 0.7);

        const Blendshape = vrm.expressionManager!;
        const PresetName = VRMExpressionPresetName;

        riggedFace.eye.l = lerp(
            clamp(1 - riggedFace.eye.l, 0, 1),
            Blendshape.getValue(PresetName.Blink)!,
            0.5,
        );
        riggedFace.eye.r = lerp(
            clamp(1 - riggedFace.eye.r, 0, 1),
            Blendshape.getValue(PresetName.Blink)!,
            0.5,
        );
        riggedFace.eye = Kalidokit.Face.stabilizeBlink(
            riggedFace.eye,
            riggedFace.head.y,
        );
        Blendshape.setValue(PresetName.Blink, riggedFace.eye.l);

        Blendshape.setValue(
            PresetName.Ih,
            lerp(
                riggedFace.mouth.shape.I,
                Blendshape.getValue(PresetName.Ih),
                0.5,
            ),
        );
        Blendshape.setValue(
            PresetName.Aa,
            lerp(
                riggedFace.mouth.shape.A,
                Blendshape.getValue(PresetName.Aa),
                0.5,
            ),
        );
        Blendshape.setValue(
            PresetName.Ee,
            lerp(
                riggedFace.mouth.shape.E,
                Blendshape.getValue(PresetName.Ee),
                0.5,
            ),
        );
        Blendshape.setValue(
            PresetName.Oh,
            lerp(
                riggedFace.mouth.shape.O,
                Blendshape.getValue(PresetName.Oh),
                0.5,
            ),
        );
        Blendshape.setValue(
            PresetName.Ou,
            lerp(
                riggedFace.mouth.shape.U,
                Blendshape.getValue(PresetName.Ou),
                0.5,
            ),
        );

        oldLookTarget.set(
            lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
            lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
            0,
            "XYZ",
        );
    }
}

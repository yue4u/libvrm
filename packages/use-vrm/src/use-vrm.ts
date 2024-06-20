"use client";

import { RefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useFrame, useLoader } from "@react-three/fiber";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import {
  createVRMAnimationClip,
  VRMAnimation,
  VRMAnimationLoaderPlugin,
  VRMLookAtQuaternionProxy,
} from "@pixiv/three-vrm-animation";

export function useVRM(vrmSrc: string): {
  vrm: VRM;
};

export function useVRM(vrmSrc: string, vrmaSrc?: string): {
  vrm: VRM;
  vrma?: VRMAnimation;
  mixer: RefObject<THREE.AnimationMixer>;
  clip?: THREE.AnimationClip;
};

/**
 * load and apply vrma from given source
 */
export function useVRM(
  vrmSrc: string,
  vrmaSrc?: string,
): {
  vrm: VRM;
  vrma?: VRMAnimation;
  mixer: RefObject<THREE.AnimationMixer>;
  clip?: THREE.AnimationClip;
} {
  const vrm = useVRMLoader(vrmSrc);
  // TODO: support mutiple animations
  const vrma = useVRMALoader(vrmaSrc);
  const result = useVRMAClip(vrm, vrma);
  return {
    vrm,
    vrma,
    ...result,
  };
}

/**
 * load {@link VRM} from url
 */
export function useVRMLoader(vrmSrc: string): VRM {
  const glb = useLoader(GLTFLoader, vrmSrc, (loader) => {
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
  });

  const vrm = useMemo(() => {
    // TODO: assert glb is VRM
    const vrm = glb.userData.vrm as VRM;
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.removeUnnecessaryJoints(vrm.scene);

    vrm.scene.traverse((obj: THREE.Object3D) => {
      obj.frustumCulled = false;
    });

    if (vrm.lookAt) {
      const lookAtQuatProxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
      lookAtQuatProxy.name = "lookAtQuaternionProxy";
      vrm.scene.add(lookAtQuatProxy);
    }
    VRMUtils.rotateVRM0(vrm);
    return vrm;
  }, [vrmSrc]);

  return vrm;
}

/**
 * load {@link VRMAnimation} from url
 */
export function useVRMALoader(vrmaSrc?: string): VRMAnimation | undefined {
  if (!vrmaSrc) return undefined;

  const glb = useLoader(GLTFLoader, vrmaSrc, (loader) => {
    loader.register((parser) => {
      return new VRMAnimationLoaderPlugin(parser);
    });
  });

  const vrma = useMemo(() => {
    return (glb.userData.vrmAnimations?.[0] ?? undefined) as
      | VRMAnimation
      | undefined;
  }, [vrmaSrc]);

  return vrma;
}

/**
 * create {@link THREE.AnimationMixer} and {@link THREE.AnimationClip} from given VRM and VRMA
 */
export function useVRMAClip(
  vrm: VRM,
  vrma?: VRMAnimation,
): { mixer: RefObject<THREE.AnimationMixer>; clip?: THREE.AnimationClip } {
  const mixer = useRef(new THREE.AnimationMixer(vrm.scene));

  useFrame((_, delta) => {
    mixer.current.update(delta);
    vrm.update(delta);
  });

  if (!vrma) return { mixer };

  return useMemo(() => {
    const clip = createVRMAnimationClip(vrma, vrm);

    // TODO: autoplay options
    mixer.current.clipAction(clip).play();

    vrm.humanoid.resetNormalizedPose();
    if (vrm.lookAt) {
      vrm.lookAt.reset();
      vrm.lookAt.autoUpdate = vrma.lookAtTrack != null;
    }

    return { mixer, clip };
  }, [vrm, vrma]);
}

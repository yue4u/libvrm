import { Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useVRM } from "use-vrm";

function Model() {
  const { vrm } = useVRM(
    "/assets/VRM1_Constraint_Twist_Sample.vrm",
    "/assets/idle_loop.vrma",
  );
  // loading is handled by suspend-react
  return <primitive object={vrm.scene} />;
}

function Scene() {
  useThree((state) => {
    state.camera.position.set(0.0, 1.0, 5.0);
  });

  return (
    <>
      <gridHelper />
      <ambientLight intensity={Math.PI} />
      <Model />
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<>loading</>}>
      <Canvas
        camera={{
          fov: 30,
          near: 0.1,
          far: 20,
        }}
      >
        <Scene />
      </Canvas>
    </Suspense>
  );
}

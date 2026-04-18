import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'

const Scene3D = () => {
  const meshRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.x = time * 0.2
    meshRef.current.rotation.y = time * 0.3
  })

  return (
    <mesh ref={meshRef} position={[2, 0, 0]}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshDistortMaterial
        color="#667eea"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
      />
    </mesh>
  )
}

export default Scene3D

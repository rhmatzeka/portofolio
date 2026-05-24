// @ts-nocheck
/* eslint-disable react/no-unknown-property */
'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import cardGLB from '../assets/lanyard/card.glb'
import killuaIcon from '../assets/lanyard/killua-icon.png'
import lanyardTextureSrc from '../assets/lanyard/lanyard.png'
import killuaCard from '../assets/images/k.jpg'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
          gl.domElement.style.background = transparent ? 'transparent' : '#000000'
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band isMobile={isMobile} />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  )
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()
  const decorations = useRef([])
  const introStart = useRef(null)
  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const cardAnchor = new THREE.Vector3()
  const cardAnchorOffset = new THREE.Vector3()
  const cardRotation = new THREE.Quaternion()
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }
  const cardScale = isMobile ? 1.92 : 2.14
  const colliderScale = cardScale / 1.05
  const anchorPosition = isMobile ? [0.02, 3.35, 0] : [0.02, 3.16, 0]
  const ropeSegmentLength = isMobile ? 0.58 : 0.5
  const jointStep = ropeSegmentLength
  const cardHookY = -1.05 + cardScale * 1.2
  const rigX = isMobile ? 0 : ropeSegmentLength * 3 + 0.1
  const cardStartY = -(jointStep * 3 + cardHookY)
  const visualHookX = 0
  const decorationPoints = isMobile ? [0.42, 0.64, 0.86] : [0.38, 0.6, 0.82]
  const { nodes, materials } = useGLTF(cardGLB)
  const lanyardTexture = useTexture(lanyardTextureSrc)
  const killuaTexture = useTexture(killuaCard)
  const killuaIconTexture = useTexture(killuaIcon)
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ])
  )
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ropeSegmentLength])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ropeSegmentLength])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ropeSegmentLength])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, cardHookY, 0]
  ])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => {
        document.body.style.cursor = 'auto'
      }
    }

    return undefined
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }

    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        )
      })
      const cardTranslation = card.current.translation()
      const cardQuaternion = card.current.rotation()
      cardAnchor
        .copy(cardAnchorOffset.set(visualHookX, cardHookY, 0))
        .applyQuaternion(cardRotation.set(cardQuaternion.x, cardQuaternion.y, cardQuaternion.z, cardQuaternion.w))
        .add(cardTranslation)
      curve.points[0].copy(cardAnchor)
      curve.points[1].copy(j3.current.translation())
      curve.points[2].copy(j2.current.lerped)
      curve.points[3].copy(j1.current.lerped)
      curve.points[4].copy(fixed.current.translation())
      curve.points.forEach((point) => {
        point.z = -0.2
      })
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32))
      decorationPoints.forEach((point, index) => {
        const decoration = decorations.current[index]
        if (decoration) {
          decoration.position.copy(curve.getPoint(point))
          decoration.position.z += 0.06
        }
      })
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      if (introStart.current === null) introStart.current = state.clock.elapsedTime
      const introSwing = 0
      if (introSwing) {
        ;[card, j1, j2, j3].forEach((ref) => ref.current?.wakeUp())
      }
      card.current.setAngvel({
        x: ang.x + introSwing * (isMobile ? 0.26 : 0.36),
        y: ang.y - rot.y * 0.25,
        z: ang.z + introSwing * (isMobile ? 0.44 : 0.62)
      })
    }
  })

  curve.curveType = 'chordal'
  lanyardTexture.wrapS = lanyardTexture.wrapT = THREE.RepeatWrapping
  lanyardTexture.anisotropy = 16
  killuaTexture.colorSpace = THREE.SRGBColorSpace
  killuaTexture.offset.set(0.08, 0.035)
  killuaTexture.repeat.set(0.84, 0.9)
  killuaIconTexture.colorSpace = THREE.SRGBColorSpace

  return (
    <>
      <group position={anchorPosition}>
        <RigidBody position={[rigX, 0, 0]} ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[rigX, -jointStep, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[rigX, -jointStep * 2, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[rigX, -jointStep * 3, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[rigX, cardStartY, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8 * colliderScale, 1.125 * colliderScale, 0.02]} />
          <group
            scale={cardScale}
            position={[0, -1.05, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(event) => {
              event.target.releasePointerCapture(event.pointerId)
              drag(false)
            }}
            onPointerDown={(event) => {
              event.target.setPointerCapture(event.pointerId)
              drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())))
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                color="#101316"
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0.25 : 0.7}
                clearcoatRoughness={0.2}
                roughness={0.58}
                metalness={0.16}
              />
            </mesh>
            <mesh position={[0, 0.522, 0.014]} renderOrder={8}>
              <planeGeometry args={[0.716, 0.986]} />
              <meshBasicMaterial
                map={killuaTexture}
                transparent
                alphaTest={0.02}
                depthWrite
                toneMapped={false}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            <mesh position={[0, 0.52, 0.08]} visible={false}>
              <planeGeometry args={[1.18, 1.35]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      {decorationPoints.map((_, index) => (
        <sprite
          key={index}
          ref={(element) => {
            decorations.current[index] = element
          }}
          scale={isMobile ? [0.22, 0.18, 1] : [0.24, 0.2, 1]}
          renderOrder={20}
        >
          <spriteMaterial
            map={killuaIconTexture}
            transparent
            alphaTest={0.04}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
      <mesh ref={band} renderOrder={0}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          depthWrite={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          transparent
          opacity={0.95}
          useMap
          map={lanyardTexture}
          repeat={[-5, 1]}
          lineWidth={isMobile ? 0.58 : 0.68}
        />
      </mesh>
    </>
  )
}

useGLTF.preload(cardGLB)
useTexture.preload(killuaIcon)
useTexture.preload(lanyardTextureSrc)
useTexture.preload(killuaCard)

// @ts-nocheck
/* eslint-disable react/no-unknown-property */
'use client'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
import lanyardTextureSrc from '../assets/lanyard/lanyard.png'
import killuaCard from '../assets/images/k.jpg'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

function drawRoundedRect(context, x, y, width, height, radius) {
  const maxRadius = Math.min(radius, width / 2, height / 2)

  context.beginPath()
  context.moveTo(x + maxRadius, y)
  context.lineTo(x + width - maxRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + maxRadius)
  context.lineTo(x + width, y + height - maxRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - maxRadius, y + height)
  context.lineTo(x + maxRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - maxRadius)
  context.lineTo(x, y + maxRadius)
  context.quadraticCurveTo(x, y, x + maxRadius, y)
  context.closePath()
}

function drawImageCover(context, image, x, y, width, height, focalX = 0.5, focalY = 0.5) {
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const sourceAspect = sourceWidth / sourceHeight
  const targetAspect = width / height
  let cropWidth = sourceWidth
  let cropHeight = sourceHeight

  if (sourceAspect > targetAspect) {
    cropWidth = sourceHeight * targetAspect
  } else {
    cropHeight = sourceWidth / targetAspect
  }

  const cropX = (sourceWidth - cropWidth) * focalX
  const cropY = (sourceHeight - cropHeight) * focalY

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, x, y, width, height)
}

function createFrontCardTexture(sourceTexture) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1408
  const context = canvas.getContext('2d')
  const image = sourceTexture.image
  const radius = 58

  context.clearRect(0, 0, canvas.width, canvas.height)
  drawRoundedRect(context, 0, 0, canvas.width, canvas.height, radius)
  context.clip()
  drawImageCover(context, image, 0, 0, canvas.width, canvas.height, 0.52, 0.48)

  const vignette = context.createRadialGradient(512, 560, 180, 512, 704, 840)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(0.72, 'rgba(0, 0, 0, 0.02)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.26)')
  context.fillStyle = vignette
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16
  texture.needsUpdate = true
  return texture
}

function createBackCardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1408
  const context = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const gradient = context.createLinearGradient(0, 0, width, height)

  gradient.addColorStop(0, '#071419')
  gradient.addColorStop(0.36, '#091b22')
  gradient.addColorStop(1, '#010304')
  drawRoundedRect(context, 0, 0, canvas.width, canvas.height, 58)
  context.clip()
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  const topGlow = context.createRadialGradient(260, 120, 0, 260, 120, 520)
  topGlow.addColorStop(0, 'rgba(0, 209, 255, 0.22)')
  topGlow.addColorStop(1, 'rgba(0, 209, 255, 0)')
  context.fillStyle = topGlow
  context.fillRect(0, 0, width, height)

  const lowerGlow = context.createRadialGradient(800, 1160, 0, 800, 1160, 520)
  lowerGlow.addColorStop(0, 'rgba(51, 102, 255, 0.12)')
  lowerGlow.addColorStop(1, 'rgba(51, 102, 255, 0)')
  context.fillStyle = lowerGlow
  context.fillRect(0, 0, width, height)

  context.save()
  context.globalAlpha = 0.42
  context.strokeStyle = 'rgba(0, 209, 255, 0.12)'
  context.lineWidth = 2
  for (let x = -height; x < width + height; x += 58) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x + height, height)
    context.stroke()
  }
  context.restore()

  context.save()
  context.globalAlpha = 0.32
  context.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  context.lineWidth = 2
  for (let y = 136; y < height - 120; y += 82) {
    context.beginPath()
    context.moveTo(90, y)
    context.lineTo(width - 90, y)
    context.stroke()
  }
  context.restore()

  context.strokeStyle = 'rgba(0, 209, 255, 0.72)'
  context.lineWidth = 18
  drawRoundedRect(context, 48, 48, width - 96, height - 96, 46)
  context.stroke()
  context.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  context.lineWidth = 4
  drawRoundedRect(context, 78, 78, width - 156, height - 156, 34)
  context.stroke()

  context.fillStyle = 'rgba(0, 209, 255, 0.1)'
  drawRoundedRect(context, 122, 126, width - 244, 86, 24)
  context.fill()
  context.strokeStyle = 'rgba(0, 209, 255, 0.28)'
  context.lineWidth = 3
  context.stroke()

  context.fillStyle = 'rgba(235, 251, 255, 0.72)'
  context.font = '700 30px Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('RAHMATDEV ACCESS CARD', width / 2, 169)

  context.fillStyle = 'rgba(0, 209, 255, 0.14)'
  context.beginPath()
  context.arc(width / 2, 396, 178, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = 'rgba(0, 209, 255, 0.34)'
  context.lineWidth = 8
  context.stroke()
  context.fillStyle = 'rgba(255, 255, 255, 0.055)'
  context.beginPath()
  context.arc(width / 2, 396, 118, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#ffffff'
  context.font = '800 132px Arial, sans-serif'
  context.fillText('R', width / 2, 396)

  context.fillStyle = 'rgba(0, 209, 255, 0.24)'
  context.fillRect(214, 610, width - 428, 4)

  context.fillStyle = '#00d1ff'
  context.font = '800 66px Arial, sans-serif'
  context.fillText('RAHMAT EKA', width / 2, 692)

  context.fillStyle = '#ffffff'
  context.font = '800 54px Arial, sans-serif'
  context.fillText('SATRIA', width / 2, 756)

  context.fillStyle = 'rgba(255, 255, 255, 0.74)'
  context.font = '700 32px Arial, sans-serif'
  context.fillText('FULLSTACK  /  WEB3  /  UI', width / 2, 852)

  const chipY = 936
  const chips = ['PORTFOLIO', 'AI', 'BLOCKCHAIN']
  const chipWidths = [176, 92, 184]
  const chipStartX = width / 2 - (chipWidths.reduce((total, current) => total + current, 0) + 48) / 2
  context.font = '800 24px Arial, sans-serif'
  chips.forEach((chip, index) => {
    const chipWidth = chipWidths[index]
    const x = chipStartX + chipWidths.slice(0, index).reduce((total, current) => total + current, 0) + index * 24
    drawRoundedRect(context, x, chipY, chipWidth, 54, 18)
    context.fillStyle = 'rgba(0, 209, 255, 0.1)'
    context.fill()
    context.strokeStyle = 'rgba(0, 209, 255, 0.26)'
    context.lineWidth = 2
    context.stroke()
    context.fillStyle = 'rgba(235, 251, 255, 0.82)'
    context.fillText(chip, x + chipWidth / 2, chipY + 29)
  })

  context.fillStyle = 'rgba(0, 209, 255, 0.16)'
  context.fillRect(182, 1086, width - 364, 3)

  context.fillStyle = 'rgba(255, 255, 255, 0.86)'
  context.font = '800 32px Arial, sans-serif'
  context.fillText('RAHMATDEV PORTFOLIO', width / 2, 1164)
  context.fillStyle = 'rgba(255, 255, 255, 0.52)'
  context.font = '700 25px Arial, sans-serif'
  context.fillText('cv.rahmateka.my.id', width / 2, 1222)

  context.save()
  context.globalAlpha = 0.5
  context.fillStyle = 'rgba(0, 209, 255, 0.32)'
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      if ((row + col) % 3 !== 1) {
        context.fillRect(194 + col * 18, 1282 + row * 15, 8, 4)
      }
    }
  }
  context.restore()

  context.fillStyle = 'rgba(255, 255, 255, 0.32)'
  context.font = '700 20px Arial, sans-serif'
  context.fillText('ID  2026  /  RHMT-EKA', width / 2, 1322)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16
  texture.needsUpdate = true
  return texture
}

export default function Lanyard({
  position = [0, 0, 42],
  gravity = [0, -40, 0],
  fov = 10,
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
  const bandVisualReady = useRef(false)
  const draggedRef = useRef(false)
  const dragMotionRef = useRef({ lastX: null, lastY: null, velocityX: 0, velocityY: 0 })
  const releaseSpinRef = useRef(null)
  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const dragEuler = new THREE.Euler()
  const dragQuaternion = new THREE.Quaternion()
  const cardAnchor = new THREE.Vector3()
  const cardAnchorOffset = new THREE.Vector3()
  const cardRotation = new THREE.Quaternion()
  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: isMobile ? 4.8 : 4.2,
    linearDamping: isMobile ? 5.2 : 4.8
  }
  const cardScale = isMobile ? 2.06 : 2.14
  const colliderScale = cardScale / 1.05
  const anchorPosition = isMobile ? [0.02, 2.25, 0] : [0.02, 3.16, 0]
  const ropeSegmentLength = isMobile ? 0.48 : 0.68
  const jointStep = ropeSegmentLength
  const cardHookY = -1.05 + cardScale * 1.2
  const visualCardHookY = isMobile
    ? -1.05 + cardScale * (1.075 + 0.155)
    : cardHookY
  const rigX = isMobile ? 0 : 0.22
  const cardStartY = -(jointStep * 3 + cardHookY)
  const visualHookX = 0
  const { nodes, materials } = useGLTF(cardGLB)
  const lanyardTexture = useTexture(lanyardTextureSrc)
  const killuaTexture = useTexture(killuaCard)
  const frontCardTexture = useMemo(() => createFrontCardTexture(killuaTexture), [killuaTexture])
  const backCardTexture = useMemo(() => createBackCardTexture(), [])
  const visualCardAnchor = useMemo(() => new THREE.Vector3(), [])
  const visualJ3 = useMemo(() => new THREE.Vector3(), [])
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

  const endDrag = () => {
    if (!draggedRef.current) return

    draggedRef.current = false
    const motion = dragMotionRef.current
    releaseSpinRef.current = {
      x: THREE.MathUtils.clamp(-motion.velocityY * 8, -5.5, 5.5),
      y: THREE.MathUtils.clamp(motion.velocityX * 10, -6.5, 6.5),
      z: THREE.MathUtils.clamp(-motion.velocityX * 6, -4.5, 4.5)
    }
    motion.lastX = null
    motion.lastY = null
    motion.velocityX = 0
    motion.velocityY = 0
    drag(false)
  }

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

  useEffect(() => {
    document.body.classList.toggle('is-lanyard-dragging', Boolean(dragged))
    return () => document.body.classList.remove('is-lanyard-dragging')
  }, [dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      const motion = dragMotionRef.current
      const pointerDeltaX = motion.lastX === null ? 0 : state.pointer.x - motion.lastX
      const pointerDeltaY = motion.lastY === null ? 0 : state.pointer.y - motion.lastY
      motion.lastX = state.pointer.x
      motion.lastY = state.pointer.y
      motion.velocityX = THREE.MathUtils.lerp(motion.velocityX, pointerDeltaX / Math.max(delta, 0.001), 0.22)
      motion.velocityY = THREE.MathUtils.lerp(motion.velocityY, pointerDeltaY / Math.max(delta, 0.001), 0.22)
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      })
      dragEuler.set(
        THREE.MathUtils.clamp(-state.pointer.y * 0.24 - motion.velocityY * 0.035, -0.48, 0.48),
        THREE.MathUtils.clamp(state.pointer.x * 0.34 + motion.velocityX * 0.045, -0.62, 0.62),
        THREE.MathUtils.clamp(-state.pointer.x * 0.18 - motion.velocityX * 0.035, -0.42, 0.42)
      )
      card.current?.setNextKinematicRotation(dragQuaternion.setFromEuler(dragEuler))
    } else {
      dragMotionRef.current.lastX = null
      dragMotionRef.current.lastY = null
    }

    if (fixed.current) {
      if (releaseSpinRef.current && card.current) {
        ;[card, j1, j2, j3].forEach((ref) => ref.current?.wakeUp())
        card.current.setAngvel(releaseSpinRef.current)
        releaseSpinRef.current = null
      }

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
        .copy(cardAnchorOffset.set(visualHookX, visualCardHookY, 0))
        .applyQuaternion(cardRotation.set(cardQuaternion.x, cardQuaternion.y, cardQuaternion.z, cardQuaternion.w))
        .add(cardTranslation)
      const j3Translation = j3.current.translation()
      if (!bandVisualReady.current || dragged) {
        visualCardAnchor.copy(cardAnchor)
        visualJ3.copy(j3Translation)
        bandVisualReady.current = true
      } else {
        const smoothing = Math.min(1, delta * 14)
        visualCardAnchor.lerp(cardAnchor, smoothing)
        visualJ3.lerp(j3Translation, smoothing)
      }
      curve.points[0].copy(visualCardAnchor)
      curve.points[1].copy(visualJ3)
      curve.points[2].copy(j2.current.lerped)
      curve.points[3].copy(j1.current.lerped)
      curve.points[4].copy(fixed.current.translation())
      curve.points.forEach((point) => {
        point.z = -0.2
      })
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32))
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({
        x: ang.x,
        y: ang.y - rot.y * 0.18,
        z: ang.z
      })
    }
  })

  curve.curveType = 'chordal'
  lanyardTexture.wrapS = lanyardTexture.wrapT = THREE.RepeatWrapping
  lanyardTexture.anisotropy = 16
  killuaTexture.colorSpace = THREE.SRGBColorSpace

  useEffect(() => {
    return () => {
      frontCardTexture.dispose()
      backCardTexture.dispose()
    }
  }, [frontCardTexture, backCardTexture])

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
              event.target.releasePointerCapture?.(event.pointerId)
              endDrag()
            }}
            onPointerCancel={() => {
              endDrag()
            }}
            onLostPointerCapture={() => {
              endDrag()
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
              event.target.setPointerCapture?.(event.pointerId)
              draggedRef.current = true
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
                map={frontCardTexture}
                transparent
                alphaTest={0.08}
                depthWrite
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, 0.522, -0.014]} rotation={[0, Math.PI, 0]} renderOrder={8}>
              <planeGeometry args={[0.716, 0.986]} />
              <meshBasicMaterial
                map={backCardTexture}
                transparent
                alphaTest={0.08}
                depthWrite
                toneMapped={false}
              />
            </mesh>
            {isMobile ? (
              <group position={[0, 1.075, 0.01]}>
                <mesh position={[0, 0.155, 0]}>
                  <torusGeometry args={[0.115, 0.024, 10, 28]} />
                  <meshStandardMaterial color="#8b949c" metalness={0.88} roughness={0.24} />
                </mesh>
                <mesh position={[0, 0.155, 0.045]} renderOrder={12}>
                  <boxGeometry args={[0.135, 0.052, 0.04]} />
                  <meshStandardMaterial
                    color="#a2aab1"
                    metalness={0.9}
                    roughness={0.2}
                    depthTest={false}
                  />
                </mesh>
                <mesh position={[0, 0.015, 0]}>
                  <capsuleGeometry args={[0.038, 0.13, 8, 16]} />
                  <meshStandardMaterial color="#626b73" metalness={0.84} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.075, 0]}>
                  <boxGeometry args={[0.19, 0.075, 0.055]} />
                  <meshStandardMaterial color="#7a838b" metalness={0.86} roughness={0.27} />
                </mesh>
              </group>
            ) : (
              <>
                <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
              </>
            )}
            <mesh position={[0, 0.52, 0.08]} visible={false}>
              <planeGeometry args={[1.18, 1.35]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band} renderOrder={0}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={isMobile}
          depthWrite={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          transparent
          opacity={1}
          useMap
          map={lanyardTexture}
          repeat={[-4, 1]}
          lineWidth={isMobile ? 1.78 : 2.05}
        />
      </mesh>
    </>
  )
}

useGLTF.preload(cardGLB)
useTexture.preload(lanyardTextureSrc)
useTexture.preload(killuaCard)

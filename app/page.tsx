"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Sun, Moon } from "lucide-react"
import type * as THREE from "three"

// Planet data with realistic proportions
const PLANET_DATA = [
  { name: "Mercury", color: "#8C7853", size: 0.38, distance: 4, speed: 4.15, info: "Closest to Sun" },
  { name: "Venus", color: "#FFC649", size: 0.95, distance: 5.5, speed: 1.62, info: "Hottest planet" },
  { name: "Earth", color: "#6B93D6", size: 1, distance: 7, speed: 1, info: "Our home planet" },
  { name: "Mars", color: "#C1440E", size: 0.53, distance: 8.5, speed: 0.53, info: "The red planet" },
  { name: "Jupiter", color: "#D8CA9D", size: 2.5, distance: 12, speed: 0.08, info: "Largest planet" },
  { name: "Saturn", color: "#FAD5A5", size: 2.1, distance: 15, speed: 0.03, info: "Has beautiful rings" },
  { name: "Uranus", color: "#4FD0E7", size: 1.6, distance: 18, speed: 0.01, info: "Ice giant" },
  { name: "Neptune", color: "#4B70DD", size: 1.5, distance: 21, speed: 0.006, info: "Windiest planet" },
]

interface PlanetProps {
  data: (typeof PLANET_DATA)[0]
  speedMultiplier: number
  isPaused: boolean
  onHover: (planet: string | null) => void
  hoveredPlanet: string | null
}

function Planet({ data, speedMultiplier, isPaused, onHover, hoveredPlanet }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame((state, delta) => {
    if (!isPaused && groupRef.current && meshRef.current) {
      // Orbital motion
      angle.current += delta * data.speed * speedMultiplier * 0.1
      groupRef.current.rotation.y = angle.current

      // Planet rotation
      meshRef.current.rotation.y += delta * 2
    }
  })

  const isHovered = hoveredPlanet === data.name

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[data.distance, 0, 0]}
        onPointerEnter={() => onHover(data.name)}
        onPointerLeave={() => onHover(null)}
        scale={isHovered ? 1.2 : 1}
      >
        <sphereGeometry args={[data.size * 0.3, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          roughness={0.8}
          metalness={0.2}
          emissive={isHovered ? data.color : "#000000"}
          emissiveIntensity={isHovered ? 0.1 : 0}
        />
        {isHovered && (
          <Html distanceFactor={10}>
            <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
              <div className="font-semibold">{data.name}</div>
              <div className="text-xs opacity-80">{data.info}</div>
            </div>
          </Html>
        )}
      </mesh>

      {/* Orbital path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.02, data.distance + 0.02, 64]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
      </mesh>
    </group>
  )
}

function SunComponent() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      <pointLight intensity={2} distance={50} decay={0.1} />
    </mesh>
  )
}

function SolarSystem({
  planetSpeeds,
  isPaused,
  hoveredPlanet,
  setHoveredPlanet,
}: {
  planetSpeeds: number[]
  isPaused: boolean
  hoveredPlanet: string | null
  setHoveredPlanet: (planet: string | null) => void
}) {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.2} />
      <SunComponent />
      {PLANET_DATA.map((planet, index) => (
        <Planet
          key={planet.name}
          data={planet}
          speedMultiplier={planetSpeeds[index]}
          isPaused={isPaused}
          onHover={setHoveredPlanet}
          hoveredPlanet={hoveredPlanet}
        />
      ))}
    </>
  )
}

function ControlPanel({
  planetSpeeds,
  setPlanetSpeeds,
  isPaused,
  setIsPaused,
  isDarkMode,
  setIsDarkMode,
}: {
  planetSpeeds: number[]
  setPlanetSpeeds: (speeds: number[]) => void
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}) {
  const updateSpeed = (planetIndex: number, newSpeed: number) => {
    const newSpeeds = [...planetSpeeds]
    newSpeeds[planetIndex] = newSpeed
    setPlanetSpeeds(newSpeeds)
  }

  return (
    <div className="absolute top-4 left-4 z-10 max-w-sm">
      <Card className={`${isDarkMode ? "bg-black/80 text-white border-gray-700" : "bg-white/90"} backdrop-blur-sm`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            Solar System Controls
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={isDarkMode ? "border-gray-600 hover:bg-gray-800" : ""}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className={isPaused ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {PLANET_DATA.map((planet, index) => (
            <div key={planet.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  style={{ backgroundColor: planet.color + "20", borderColor: planet.color }}
                  className="text-xs"
                >
                  {planet.name}
                </Badge>
                <span className="text-xs opacity-70">{planetSpeeds[index].toFixed(1)}x</span>
              </div>
              <Slider
                value={[planetSpeeds[index]]}
                onValueChange={(value) => updateSpeed(index, value[0])}
                max={5}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs opacity-70">Use mouse to rotate view. Hover over planets for info.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Component() {
  const [planetSpeeds, setPlanetSpeeds] = useState(PLANET_DATA.map(() => 1))
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : ""
  }, [isDarkMode])

  return (
    <div className={`w-full h-screen relative ${isDarkMode ? "bg-black" : "bg-blue-50"}`}>
      <Canvas camera={{ position: [0, 10, 25], fov: 60 }} gl={{ antialias: true }}>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
          autoRotate={!isPaused}
          autoRotateSpeed={0.5}
        />
        <SolarSystem
          planetSpeeds={planetSpeeds}
          isPaused={isPaused}
          hoveredPlanet={hoveredPlanet}
          setHoveredPlanet={setHoveredPlanet}
        />
      </Canvas>

      <ControlPanel
        planetSpeeds={planetSpeeds}
        setPlanetSpeeds={setPlanetSpeeds}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className={`${isDarkMode ? "bg-black/80 text-white border-gray-700" : "bg-white/90"} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">3D Solar System</h3>
            <div className="text-sm space-y-1 opacity-80">
              <p>• Realistic planetary orbits and sizes</p>
              <p>• Individual speed controls</p>
              <p>• Interactive camera controls</p>
              <p>• Hover planets for information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

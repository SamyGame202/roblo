import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { GameExperience, UserProfileData } from '../types';
import { buildRobloxCharacter, CharacterRig } from '../utils/avatarMeshBuilder';
import { sounds } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  MessageSquare,
  Users,
  Send,
  Sparkles,
  Trophy,
  Flame,
  ArrowUp,
  Shield,
  HelpCircle
} from 'lucide-react';

interface GamePlayer3DProps {
  game: GameExperience;
  user: UserProfileData;
  onExit: () => void;
  onAwardBadge?: (badgeName: string) => void;
}

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

export const GamePlayer3D: React.FC<GamePlayer3DProps> = ({
  game,
  user,
  onExit,
  onAwardBadge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEscMenuOpen, setIsEscMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'System', text: `Joined server for ${game.title}. Welcome, ${user.username}!`, time: '12:00' },
    { sender: 'NoobMaster77', text: 'yooo who wants to race?', time: '12:01' },
    { sender: 'BladeStriker_X', text: 'gg last round!', time: '12:02' },
  ]);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isDancing, setIsDancing] = useState(false);
  const [bladeBallState, setBladeBallState] = useState({
    ballSpeed: 18,
    target: 'Player',
    streak: 0,
    roundWon: false,
  });
  const [wonGame, setWonGame] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // References for Game Loop and ThreeJS objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRigRef = useRef<CharacterRig | null>(null);

  // Gameplay State Refs
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 0));
  const playerVelRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const checkpointPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 0));
  const isGroundedRef = useRef(true);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cameraAnglesRef = useRef({ yaw: 0, pitch: 0.35, distance: 9 });
  const isMouseDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const killBricksRef = useRef<THREE.Mesh[]>([]);
  const trampolinesRef = useRef<THREE.Mesh[]>([]);
  const checkpointsRef = useRef<{ mesh: THREE.Mesh; pos: THREE.Vector3; stageNum: number }[]>([]);
  const spinnersRef = useRef<THREE.Mesh[]>([]);
  const trophyMeshRef = useRef<THREE.Mesh | null>(null);
  const boostPadsRef = useRef<THREE.Mesh[]>([]);

  // Blade Ball Refs
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const ballTargetRef = useRef<'player' | 'bot1' | 'bot2'>('player');
  const ballSpeedRef = useRef(18);
  const botRigsRef = useRef<{ id: string; name: string; rig: CharacterRig; pos: THREE.Vector3; alive: boolean }[]>([]);
  const deflectCooldownRef = useRef(false);

  // Audio mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Reset Character handler (Classic Roblox Reset)
  const handleResetCharacter = useCallback(() => {
    sounds.playOof();
    playerPosRef.current.copy(checkpointPosRef.current);
    playerVelRef.current.set(0, 0, 0);
    setIsEscMenuOpen(false);
  }, []);

  // Send Chat message (supports /dance command!)
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const trimmed = chatInput.trim();
    if (trimmed.toLowerCase() === '/dance') {
      setIsDancing(true);
      setTimeout(() => setIsDancing(false), 8000);
      setChatMessages((prev) => [
        ...prev,
        { sender: user.displayName, text: '/dance', time: 'Now' },
        { sender: 'System', text: `${user.displayName} started dancing!`, time: 'Now' },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        { sender: user.displayName, text: trimmed, time: 'Now' },
      ]);
    }
    setChatInput('');
  };

  // Blade Ball Deflect Action
  const triggerDeflect = useCallback(() => {
    if (game.gameMode !== 'blade_ball' || !ballMeshRef.current || deflectCooldownRef.current) return;

    const distToPlayer = ballMeshRef.current.position.distanceTo(playerPosRef.current);
    // Deflect window radius: 6.5 units
    if (distToPlayer < 6.8) {
      deflectCooldownRef.current = true;
      sounds.playDeflect();

      // Flash ball cyan/green
      const ballMat = ballMeshRef.current.material as THREE.MeshStandardMaterial;
      ballMat.color.setHex(0x06b6d4);
      ballMat.emissive.setHex(0x22d3ee);

      ballSpeedRef.current += 3.5;
      setBladeBallState((prev) => ({
        ...prev,
        ballSpeed: Math.round(ballSpeedRef.current),
        streak: prev.streak + 1,
        target: 'AI Bot',
      }));

      // Target an alive bot
      const aliveBots = botRigsRef.current.filter((b) => b.alive);
      if (aliveBots.length > 0) {
        ballTargetRef.current = aliveBots[Math.floor(Math.random() * aliveBots.length)].id as 'bot1' | 'bot2';
      }

      setTimeout(() => {
        deflectCooldownRef.current = false;
        if (ballMat) {
          ballMat.color.setHex(0xef4444);
          ballMat.emissive.setHex(0xf87171);
        }
      }, 350);
    }
  }, [game.gameMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Roblox sky & atmospheric fog
    scene.background = new THREE.Color(0x71a5de);
    scene.fog = new THREE.FogExp2(0x71a5de, 0.008);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8eb, 1.3);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const shadowD = 50;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    scene.add(sunLight);

    // Grid Floor / Baseplate
    const baseplateGeo = new THREE.PlaneGeometry(300, 300);
    const baseplateMat = new THREE.MeshStandardMaterial({
      color: 0x272931,
      roughness: 0.8,
    });
    const baseplate = new THREE.Mesh(baseplateGeo, baseplateMat);
    baseplate.rotation.x = -Math.PI / 2;
    baseplate.position.y = -2;
    baseplate.receiveShadow = true;
    scene.add(baseplate);

    // Classic grid overlay for Roblox studio feel
    const gridHelper = new THREE.GridHelper(300, 75, 0x555866, 0x383b47);
    gridHelper.position.y = -1.98;
    scene.add(gridHelper);

    // BUILD MAIN PLAYER RIG
    const playerRig = buildRobloxCharacter(user.avatarColors, user.equippedItems);
    playerRigRef.current = playerRig;
    scene.add(playerRig.root);

    // BUILD LEVEL BASED ON GAME MODE
    const killBricks: THREE.Mesh[] = [];
    const trampolines: THREE.Mesh[] = [];
    const checkpoints: { mesh: THREE.Mesh; pos: THREE.Vector3; stageNum: number }[] = [];
    const spinners: THREE.Mesh[] = [];
    const boostPads: THREE.Mesh[] = [];

    if (game.gameMode === 'blade_ball') {
      // ----------------- BLADE BALL ARENA -----------------
      // Circular battle platform
      const arenaGeo = new THREE.CylinderGeometry(26, 26, 1.5, 48);
      const arenaMat = new THREE.MeshStandardMaterial({
        color: 0x181920,
        roughness: 0.3,
        metalness: 0.2,
      });
      const arena = new THREE.Mesh(arenaGeo, arenaMat);
      arena.position.y = 0.75;
      arena.receiveShadow = true;
      scene.add(arena);

      // Glowing Arena Border Ring
      const ringGeo = new THREE.TorusGeometry(26, 0.4, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x2563eb,
        emissiveIntensity: 1.2,
      });
      const borderRing = new THREE.Mesh(ringGeo, ringMat);
      borderRing.rotation.x = Math.PI / 2;
      borderRing.position.y = 1.6;
      scene.add(borderRing);

      // Deflect Homing Ball
      const ballGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const ballMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xf87171,
        emissiveIntensity: 1.8,
        roughness: 0.1,
      });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(0, 3.2, 0);
      scene.add(ball);
      ballMeshRef.current = ball;

      // Spawn 2 AI Bots in Arena
      const bots = [
        { id: 'bot1', name: 'NinjaBot', color: { head: '#ef4444', torso: '#1f2937', leftArm: '#ef4444', rightArm: '#ef4444', leftLeg: '#111827', rightLeg: '#111827' }, x: -12, z: 8 },
        { id: 'bot2', name: 'CyberBot', color: { head: '#3b82f6', torso: '#047857', leftArm: '#3b82f6', rightArm: '#3b82f6', leftLeg: '#064e3b', rightLeg: '#064e3b' }, x: 14, z: -7 },
      ];

      botRigsRef.current = bots.map((b) => {
        const rig = buildRobloxCharacter(b.color, { hat: 'fedora-1', face: 'face-chill' });
        rig.root.position.set(b.x, 1.5, b.z);
        scene.add(rig.root);
        return {
          id: b.id,
          name: b.name,
          rig,
          pos: new THREE.Vector3(b.x, 1.5, b.z),
          alive: true,
        };
      });

      playerPosRef.current.set(0, 1.5, 14);
      checkpointPosRef.current.set(0, 1.5, 14);
    } else {
      // ----------------- RAINBOW OBBY / PLATFORMER LEVEL -----------------
      // Spawn platform
      const spawnGeo = new THREE.CylinderGeometry(5, 5, 1, 24);
      const spawnMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
      const spawnPad = new THREE.Mesh(spawnGeo, spawnMat);
      spawnPad.position.set(0, 0.5, 0);
      spawnPad.receiveShadow = true;
      scene.add(spawnPad);

      // Checkpoint 1 marker
      checkpoints.push({ mesh: spawnPad, pos: new THREE.Vector3(0, 1.5, 0), stageNum: 1 });

      // Stage 1: Rainbow Stepped Blocks (Red, Orange, Yellow, Green, Cyan, Blue, Violet)
      const rainbowColors = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x06b6d4, 0x3b82f6, 0xa855f7];
      rainbowColors.forEach((color, i) => {
        const blockGeo = new THREE.BoxGeometry(3.2, 0.8, 3.2);
        const blockMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
        const block = new THREE.Mesh(blockGeo, blockMat);
        block.position.set(0, 1.2 + i * 0.9, -7 - i * 5);
        block.castShadow = true;
        block.receiveShadow = true;
        scene.add(block);
      });

      // Checkpoint 2 platform
      const cp2Geo = new THREE.BoxGeometry(8, 1, 8);
      const cp2Mat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.4 });
      const cp2 = new THREE.Mesh(cp2Geo, cp2Mat);
      cp2.position.set(0, 7.8, -46);
      scene.add(cp2);
      checkpoints.push({ mesh: cp2, pos: new THREE.Vector3(0, 8.8, -46), stageNum: 2 });

      // Checkpoint 2 Beacon Light
      const beaconGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        emissive: 0x6366f1,
        transparent: true,
        opacity: 0.6,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 14.8, -46);
      scene.add(beacon);

      // Stage 2: Red Lava Kill Bricks! Jump between them!
      const pathGeo = new THREE.BoxGeometry(4.5, 0.8, 4.5);
      const pathMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

      for (let j = 0; j < 5; j++) {
        // Safe stone block
        const safeStone = new THREE.Mesh(pathGeo, pathMat);
        safeStone.position.set(0, 7.8, -55 - j * 10);
        scene.add(safeStone);

        // Lava kill block in between
        const lavaGeo = new THREE.BoxGeometry(3.8, 0.5, 3.8);
        const lavaMat = new THREE.MeshStandardMaterial({
          color: 0xff0033,
          emissive: 0xef4444,
          emissiveIntensity: 1.5,
        });
        const lava = new THREE.Mesh(lavaGeo, lavaMat);
        lava.position.set(0, 7.7, -50 - j * 10);
        scene.add(lava);
        killBricks.push(lava);
      }

      // Checkpoint 3: Spinner Platform
      const cp3Geo = new THREE.CylinderGeometry(6, 6, 1, 24);
      const cp3Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
      const cp3 = new THREE.Mesh(cp3Geo, cp3Mat);
      cp3.position.set(0, 7.8, -108);
      scene.add(cp3);
      checkpoints.push({ mesh: cp3, pos: new THREE.Vector3(0, 8.8, -108), stageNum: 3 });

      // Kinetic Spinning Hazard Beam
      const spinBeamGeo = new THREE.BoxGeometry(11, 0.9, 1.2);
      const spinBeamMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        roughness: 0.2,
      });
      const spinBeam = new THREE.Mesh(spinBeamGeo, spinBeamMat);
      spinBeam.position.set(0, 8.8, -108);
      scene.add(spinBeam);
      spinners.push(spinBeam);

      // Trampoline Launch Pad
      const trampGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.6, 24);
      const trampMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xdb2777,
        emissiveIntensity: 0.8,
      });
      const tramp = new THREE.Mesh(trampGeo, trampMat);
      tramp.position.set(0, 7.8, -122);
      scene.add(tramp);
      trampolines.push(tramp);

      // Speed run boost pad if speed run
      if (game.gameMode === 'speed_run') {
        const boostGeo = new THREE.BoxGeometry(4, 0.3, 8);
        const boostMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xfbbf24,
          emissiveIntensity: 1.4,
        });
        const pad = new THREE.Mesh(boostGeo, boostMat);
        pad.position.set(0, 1.2, -18);
        scene.add(pad);
        boostPads.push(pad);
      }

      // Summit Victory Island!
      const summitGeo = new THREE.CylinderGeometry(8, 8, 1.5, 32);
      const summitMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.4,
        roughness: 0.2,
      });
      const summit = new THREE.Mesh(summitGeo, summitMat);
      summit.position.set(0, 16.5, -145);
      scene.add(summit);

      // Golden Winner Trophy
      const trophyGeo = new THREE.ConeGeometry(1.6, 2.5, 16);
      const trophyMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.1,
        emissive: 0xb45309,
      });
      const trophy = new THREE.Mesh(trophyGeo, trophyMat);
      trophy.position.set(0, 18.8, -145);
      trophy.rotation.x = Math.PI;
      scene.add(trophy);
      trophyMeshRef.current = trophy;

      playerPosRef.current.set(0, 2, 0);
      checkpointPosRef.current.set(0, 2, 0);
    }

    killBricksRef.current = killBricks;
    trampolinesRef.current = trampolines;
    checkpointsRef.current = checkpoints;
    spinnersRef.current = spinners;
    boostPadsRef.current = boostPads;

    // KEYBOARD LISTENERS
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') {
        setIsEscMenuOpen((prev) => !prev);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsLeaderboardOpen((prev) => !prev);
      }
      if (e.key === ' ' || e.key.toLowerCase() === 'f') {
        if (game.gameMode === 'blade_ball') {
          triggerDeflect();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    // MOUSE CAMERA ORBIT LISTENERS
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isMouseDownRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      cameraAnglesRef.current.yaw -= dx * 0.006;
      cameraAnglesRef.current.pitch = Math.max(0.05, Math.min(1.4, cameraAnglesRef.current.pitch + dy * 0.006));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      cameraAnglesRef.current.distance = Math.max(4, Math.min(18, cameraAnglesRef.current.distance + e.deltaY * 0.01));
    };

    const dom = renderer.domElement;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('wheel', handleWheel, { passive: true });

    // RESIZE LISTENER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // MAIN ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. ROTATE SPINNERS & TROPHIES
      spinnersRef.current.forEach((spinner) => {
        spinner.rotation.y += delta * 2.2;
      });
      if (trophyMeshRef.current) {
        trophyMeshRef.current.rotation.y += delta * 1.5;
      }

      // 2. BLADE BALL HOMING LOGIC
      if (game.gameMode === 'blade_ball' && ballMeshRef.current) {
        const ball = ballMeshRef.current;
        let targetPos = playerPosRef.current;

        if (ballTargetRef.current !== 'player') {
          const targetedBot = botRigsRef.current.find((b) => b.id === ballTargetRef.current && b.alive);
          if (targetedBot) {
            targetPos = targetedBot.pos;
          } else {
            ballTargetRef.current = 'player';
          }
        }

        const dirToTarget = new THREE.Vector3().subVectors(targetPos, ball.position).normalize();
        ball.position.addScaledVector(dirToTarget, ballSpeedRef.current * delta);
        ball.rotation.x += delta * 10;
        ball.rotation.y += delta * 8;

        // Check if ball reached target
        const dist = ball.position.distanceTo(targetPos);
        if (dist < 1.4) {
          if (ballTargetRef.current === 'player') {
            // Player got hit!
            sounds.playOof();
            ballSpeedRef.current = 18;
            setBladeBallState((prev) => ({ ...prev, streak: 0, ballSpeed: 18 }));
            ball.position.set(0, 3.2, 0);
            ballTargetRef.current = 'player';
          } else {
            // Bot got hit! Bot deflects or gets eliminated!
            const hitBot = botRigsRef.current.find((b) => b.id === ballTargetRef.current);
            if (hitBot && hitBot.alive) {
              if (Math.random() < 0.35) {
                // Bot Deflected back!
                sounds.playDeflect();
                ballTargetRef.current = 'player';
                ballSpeedRef.current += 2;
                setBladeBallState((prev) => ({ ...prev, target: 'Player (DEFLECT NOW!)' }));
              } else {
                // Bot Eliminated!
                sounds.playOof();
                hitBot.alive = false;
                scene.remove(hitBot.rig.root);
                ballTargetRef.current = 'player';
                ballSpeedRef.current = 18;
                setScore((s) => s + 500);

                const remaining = botRigsRef.current.filter((b) => b.alive).length;
                if (remaining === 0) {
                  // Round Won!
                  sounds.playVictory();
                  setBladeBallState((prev) => ({ ...prev, roundWon: true }));
                  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                  if (onAwardBadge) onAwardBadge('Blade Champion');
                }
              }
            }
          }
        }
      }

      // 3. PLAYER MOVEMENT & PHYSICS
      const moveSpeed = keysRef.current['shift'] ? 13 : 8.5;
      const inputVector = new THREE.Vector2(0, 0);

      if (keysRef.current['w'] || keysRef.current['arrowup']) inputVector.y -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) inputVector.y += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) inputVector.x -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) inputVector.x += 1;

      if (inputVector.lengthSq() > 0) {
        inputVector.normalize();
      }

      // Project input relative to camera yaw
      const forward = new THREE.Vector3(-Math.sin(cameraAnglesRef.current.yaw), 0, -Math.cos(cameraAnglesRef.current.yaw));
      const right = new THREE.Vector3(Math.cos(cameraAnglesRef.current.yaw), 0, -Math.sin(cameraAnglesRef.current.yaw));

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, -inputVector.y)
        .addScaledVector(right, inputVector.x);

      playerPosRef.current.x += moveDir.x * moveSpeed * delta;
      playerPosRef.current.z += moveDir.z * moveSpeed * delta;

      // Jump & Gravity
      const gravity = -32;
      playerVelRef.current.y += gravity * delta;
      playerPosRef.current.y += playerVelRef.current.y * delta;

      // Ground floor collision
      const groundFloorY = 1.0;
      if (playerPosRef.current.y <= groundFloorY) {
        playerPosRef.current.y = groundFloorY;
        playerVelRef.current.y = 0;
        isGroundedRef.current = true;
      }

      // Jump Action (Spacebar)
      if (keysRef.current[' '] && isGroundedRef.current && game.gameMode !== 'blade_ball') {
        playerVelRef.current.y = 12.5;
        isGroundedRef.current = false;
        sounds.playJump();
      }

      // Void Fall Check (Fall off platforms)
      if (playerPosRef.current.y < -12) {
        handleResetCharacter();
      }

      // Lava Kill Brick Collisions
      killBricksRef.current.forEach((lava) => {
        const dist = playerPosRef.current.distanceTo(lava.position);
        if (dist < 2.2) {
          handleResetCharacter();
        }
      });

      // Trampoline Launch Pads
      trampolinesRef.current.forEach((tramp) => {
        const dist = playerPosRef.current.distanceTo(tramp.position);
        if (dist < 2.8 && playerPosRef.current.y <= tramp.position.y + 1.2) {
          playerVelRef.current.y = 24; // Super launch!
          isGroundedRef.current = false;
          sounds.playJump();
        }
      });

      // Checkpoint Triggers
      checkpointsRef.current.forEach((cp) => {
        const dist = playerPosRef.current.distanceTo(cp.pos);
        if (dist < 4.0 && cp.pos.distanceTo(checkpointPosRef.current) > 1.0) {
          checkpointPosRef.current.copy(cp.pos);
          setStage(cp.stageNum);
          sounds.playCheckpoint();
          setCoins((c) => c + 25);
        }
      });

      // Trophy Victory Summit Check
      if (trophyMeshRef.current) {
        const distToTrophy = playerPosRef.current.distanceTo(trophyMeshRef.current.position);
        if (distToTrophy < 3.5 && !wonGame) {
          setWonGame(true);
          sounds.playVictory();
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
          });
          if (onAwardBadge) onAwardBadge('Obby Master');
        }
      }

      // 4. ANIMATE PLAYER RIG (Walk cycle or Dance)
      if (playerRigRef.current) {
        const rig = playerRigRef.current;
        rig.root.position.copy(playerPosRef.current);

        if (moveDir.lengthSq() > 0.01) {
          // Face moving direction
          const targetAngle = Math.atan2(moveDir.x, moveDir.z);
          rig.root.rotation.y = THREE.MathUtils.lerp(rig.root.rotation.y, targetAngle, 0.2);

          // Walk limb swinging
          const walkCycle = Math.sin(time * 12);
          rig.leftArm.rotation.x = walkCycle * 0.7;
          rig.rightArm.rotation.x = -walkCycle * 0.7;
          rig.leftLeg.rotation.x = -walkCycle * 0.7;
          rig.rightLeg.rotation.x = walkCycle * 0.7;
        } else if (isDancing) {
          // Classic Roblox /dance animation!
          const danceCycle = Math.sin(time * 8);
          const hipSway = Math.cos(time * 8);
          rig.root.rotation.y = time * 2;
          rig.leftArm.rotation.z = Math.abs(danceCycle) * 1.2;
          rig.rightArm.rotation.z = -Math.abs(danceCycle) * 1.2;
          rig.torso.rotation.z = hipSway * 0.2;
        } else {
          // Idle breathing
          rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, 0, 0.1);
          rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, 0, 0.1);
          rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, 0.1);
          rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, 0.1);
        }
      }

      // 5. CAMERA THIRD-PERSON ORBIT TRACKING
      if (cameraRef.current) {
        const { yaw, pitch, distance } = cameraAnglesRef.current;
        const camOffset = new THREE.Vector3(
          Math.sin(yaw) * Math.cos(pitch) * distance,
          Math.sin(pitch) * distance + 1.5,
          Math.cos(yaw) * Math.cos(pitch) * distance
        );

        cameraRef.current.position.copy(playerPosRef.current).add(camOffset);
        cameraRef.current.lookAt(playerPosRef.current.x, playerPosRef.current.y + 1.6, playerPosRef.current.z);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [game, user, handleResetCharacter, triggerDeflect, wonGame, isDancing, onAwardBadge]);

  return (
    <div ref={containerRef} className="relative w-full h-[88vh] bg-[#111216] select-none overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {/* TOPBAR HUD (Authentic Roblox In-Game Bar) */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-20">
        {/* Left: Roblox Logo Button (ESC Menu) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEscMenuOpen(!isEscMenuOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Menu (Esc)"
          >
            {/* Iconic tilted Roblox logo square */}
            <div className="w-4 h-4 bg-white rotate-12 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#191b1f] -rotate-12" />
            </div>
          </button>

          <span className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
            {game.title}
          </span>
        </div>

        {/* Center: Stage / Score indicators */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          {game.gameMode === 'blade_ball' ? (
            <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/30 px-3 py-1 rounded-md text-red-300">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Ball Speed: <strong className="font-mono text-white">{bladeBallState.ballSpeed}</strong></span>
              <span>·</span>
              <span>Streak: <strong className="font-mono text-white">{bladeBallState.streak}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-md">
              <span>Stage: <strong className="font-mono text-white">{stage}/50</strong></span>
              <span>·</span>
              <span>Coins: <strong className="font-mono text-amber-400">{coins} 🟡</strong></span>
            </div>
          )}
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer ${
              isChatOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
            title="Toggle Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
            className={`p-2 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer ${
              isLeaderboardOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
            title="Leaderboard (Tab)"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-1"
            title="Leave Game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK CONTROLS HINT (Floating bottom-left) */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 text-[11px] text-slate-400 bg-black/40 backdrop-blur-sm p-2.5 rounded-lg border border-white/5 pointer-events-none">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <span>WASD / Arrows</span>
          <span className="text-slate-500">to Move</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <span>Spacebar</span>
          <span className="text-slate-500">{game.gameMode === 'blade_ball' ? 'to Parry / Deflect' : 'to Jump'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <span>Click + Drag</span>
          <span className="text-slate-500">to Rotate Camera</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <span>Scroll</span>
          <span className="text-slate-500">to Zoom</span>
        </div>
      </div>

      {/* BLADE BALL PARRY BUTTON FOR TOUCH / CLICK */}
      {game.gameMode === 'blade_ball' && (
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2">
          <button
            onClick={triggerDeflect}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 active:scale-95 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 border-2 border-white/40 flex flex-col items-center justify-center transition-all cursor-pointer"
          >
            <Shield className="w-6 h-6 mb-1" />
            <span>DEFLECT</span>
          </button>
          <span className="text-[10px] text-cyan-300 bg-black/60 px-2 py-0.5 rounded">Space / F / Click</span>
        </div>
      )}

      {/* JUMP BUTTON (Mobile friendly / accessible) */}
      {game.gameMode !== 'blade_ball' && (
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2">
          <button
            onClick={() => {
              if (isGroundedRef.current) {
                playerVelRef.current.y = 12.5;
                isGroundedRef.current = false;
                sounds.playJump();
              }
            }}
            className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold shadow-lg border border-white/20 flex items-center justify-center cursor-pointer"
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* CHAT DRAWER */}
      {isChatOpen && (
        <div className="absolute top-14 left-4 w-72 bg-black/75 backdrop-blur-md rounded-lg border border-white/10 p-3 z-30 shadow-xl flex flex-col h-64">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
            <span>In-Game Chat</span>
            <span className="text-[10px] text-slate-400">Type /dance to dance</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 space-y-1.5 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className="leading-tight">
                <span className="font-semibold text-cyan-400 mr-1.5">{msg.sender}:</span>
                <span className="text-slate-200">{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-1.5 pt-2 border-t border-white/10">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Chat here or /dance..."
              className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 px-2.5 py-1 rounded text-white text-xs cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* LEADERBOARD (TAB) */}
      {isLeaderboardOpen && (
        <div className="absolute top-14 right-4 w-64 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 p-3 z-30 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
            <span>Players ({user.username} + 3 bots)</span>
            <span className="font-mono text-emerald-400 text-[10px]">24ms</span>
          </div>
          <div className="py-2 space-y-2 text-xs">
            <div className="flex items-center justify-between text-cyan-300 font-medium">
              <span>{user.displayName} (You)</span>
              <span className="font-mono">{game.gameMode === 'blade_ball' ? `${bladeBallState.streak} wins` : `Stage ${stage}`}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>NoobMaster77</span>
              <span className="font-mono">Stage 14</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>BladeStriker_X</span>
              <span className="font-mono">Stage 22</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Luna_Builder</span>
              <span className="font-mono">Stage 9</span>
            </div>
          </div>
        </div>
      )}

      {/* ESCAPE / SETTINGS MENU MODAL */}
      {isEscMenuOpen && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-40 p-4">
          <div className="bg-[#1f2229] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-7 h-7 bg-white rotate-12 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#1f2229] -rotate-12" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">Experience Menu</h2>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setIsEscMenuOpen(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm"
              >
                Resume Experience
              </button>

              <button
                onClick={handleResetCharacter}
                className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Character (OOF!)</span>
              </button>

              <button
                onClick={() => {
                  setIsDancing(true);
                  setIsEscMenuOpen(false);
                  setTimeout(() => setIsDancing(false), 8000);
                }}
                className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Dance Emote (/dance)</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm"
              >
                Leave Experience
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-4 pt-4 border-t border-white/10">
              <span>Server ID: {game.id}-01</span>
              <span>·</span>
              <span>Roblox Engine v2026.3</span>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {wonGame && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-gradient-to-b from-[#252834] to-[#181920] border border-amber-400/40 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mb-4">
              🏆
            </div>
            <h3 className="text-2xl font-bold text-amber-300 mb-1">VICTORY SUMMIT!</h3>
            <p className="text-sm text-slate-300 mb-6">
              You conquered the entire obstacle course! Obby Master badge awarded to your Roblox profile.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setWonGame(false);
                  handleResetCharacter();
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-sm"
              >
                Play Again
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

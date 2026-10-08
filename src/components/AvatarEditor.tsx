import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { UserProfileData, AvatarColors, BodyPart } from '../types';
import { buildRobloxCharacter, CharacterRig } from '../utils/avatarMeshBuilder';
import { CATALOG_ITEMS } from '../data/mockData';
import { sounds } from '../utils/audio';
import { RotateCw, Check, Sparkles, Sliders, Palette, Shirt } from 'lucide-react';

interface AvatarEditorProps {
  user: UserProfileData;
  onUpdateAvatar: (colors: AvatarColors, equipped: UserProfileData['equippedItems']) => void;
}

const ROBLOX_PALETTE = [
  { name: 'Bright Yellow', hex: '#FEDC56' },
  { name: 'Bright Blue', hex: '#0D69AC' },
  { name: 'Bright Green', hex: '#A4BD47' },
  { name: 'Bright Red', hex: '#DA2C43' },
  { name: 'Dark Stone Grey', hex: '#393B44' },
  { name: 'White', hex: '#F2F3F3' },
  { name: 'Black', hex: '#1B2A35' },
  { name: 'Light Orange', hex: '#E29B40' },
  { name: 'Dark Green', hex: '#285F3A' },
  { name: 'Pastel Blue', hex: '#74869D' },
  { name: 'Medium Purple', hex: '#7C3AED' },
  { name: 'Hot Pink', hex: '#EC4899' },
];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ user, onUpdateAvatar }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<AvatarColors>(user.avatarColors);
  const [equipped, setEquipped] = useState(user.equippedItems);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'skin' | 'hats' | 'accessories' | 'faces'>('skin');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ThreeJS 3D preview refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rigRef = useRef<CharacterRig | null>(null);
  const charRotRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);

  // Setup 3D Avatar Preview Viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1c23);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.8);
    camera.lookAt(0, 1.8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-6, 3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.9);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Pedestal
    const pedGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.4, 32);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x272a34, roughness: 0.5 });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.2;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Initial character
    const rig = buildRobloxCharacter(colors, equipped);
    rigRef.current = rig;
    scene.add(rig.root);

    // Mouse drag rotation
    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      charRotRef.current += dx * 0.015;
      lastXRef.current = e.clientX;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // Render loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (rigRef.current) {
        rigRef.current.root.rotation.y = charRotRef.current;
        // Subtle breathing animation
        rigRef.current.head.position.y = 1.6 + Math.sin(time * 2) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Three.js rig when colors or equipped items change
  useEffect(() => {
    if (!sceneRef.current) return;

    if (rigRef.current) {
      sceneRef.current.remove(rigRef.current.root);
    }
    const newRig = buildRobloxCharacter(colors, equipped);
    newRig.root.rotation.y = charRotRef.current;
    rigRef.current = newRig;
    sceneRef.current.add(newRig.root);
  }, [colors, equipped]);

  const handleColorPick = (hex: string) => {
    sounds.playClick();
    if (selectedBodyPart === 'all') {
      setColors({
        head: hex,
        torso: hex,
        leftArm: hex,
        rightArm: hex,
        leftLeg: hex,
        rightLeg: hex,
      });
    } else {
      setColors((prev) => ({
        ...prev,
        [selectedBodyPart]: hex,
      }));
    }
  };

  const handleEquipItem = (category: 'hat' | 'accessory' | 'face', id: string) => {
    sounds.playClick();
    setEquipped((prev) => ({
      ...prev,
      [category]: prev[category] === id ? undefined : id,
    }));
  };

  const handleSaveAvatar = () => {
    sounds.playCheckpoint();
    onUpdateAvatar(colors, equipped);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Filter items in catalog that are in user's inventory or free
  const inventoryItems = CATALOG_ITEMS.filter(
    (item) => user.inventoryIds.includes(item.id) || item.isFree
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Avatar Customizer</h1>
          <p className="text-sm text-slate-400">
            Rotate and customize your 3D Roblox character. Changes apply to all live experiences!
          </p>
        </div>
        <button
          onClick={handleSaveAvatar}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-lg transition-all shadow-md cursor-pointer text-sm"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Outfit Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Save Avatar</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 3D INTERACTIVE VIEWPORT (5 cols) */}
        <div className="lg:col-span-5 bg-[#191b22] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-medium text-slate-300">
            <span>3D Character Preview</span>
            <span className="text-slate-400">Drag to rotate 360°</span>
          </div>

          <div
            ref={containerRef}
            className="w-full h-[400px] sm:h-[460px] relative cursor-grab active:cursor-grabbing"
          >
            {/* Quick Rotate Button */}
            <button
              onClick={() => {
                charRotRef.current += Math.PI / 4;
              }}
              className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Turn Character"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMIZATION TABS & PALETTES (7 cols) */}
        <div className="lg:col-span-7 bg-[#191b22] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('skin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'skin' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Skin Tone</span>
            </button>
            <button
              onClick={() => setActiveTab('hats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'hats' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Hats ({inventoryItems.filter((i) => i.category === 'hat').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'accessories' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accessories ({inventoryItems.filter((i) => i.category === 'accessory').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('faces')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'faces' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Faces</span>
            </button>
          </div>

          {/* TAB 1: SKIN TONE MATRIX */}
          {activeTab === 'skin' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Select Target Body Part:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Body' },
                    { id: 'head', label: 'Head' },
                    { id: 'torso', label: 'Torso' },
                    { id: 'leftArm', label: 'Left Arm' },
                    { id: 'rightArm', label: 'Right Arm' },
                    { id: 'leftLeg', label: 'Left Leg' },
                    { id: 'rightLeg', label: 'Right Leg' },
                  ].map((part) => (
                    <button
                      key={part.id}
                      onClick={() => setSelectedBodyPart(part.id as BodyPart | 'all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        selectedBodyPart === part.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Classic Roblox Color Palette:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {ROBLOX_PALETTE.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleColorPick(c.hex)}
                      className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-lg shadow-inner border border-white/20 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] text-slate-400 truncate max-w-[70px] text-center">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HATS */}
          {activeTab === 'hats' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Click a hat from your inventory to equip or unequip it.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATALOG_ITEMS.filter((i) => i.category === 'hat').map((hat) => {
                  const isEquipped = equipped.hat === hat.id;
                  const isOwned = user.inventoryIds.includes(hat.id);
                  return (
                    <div
                      key={hat.id}
                      onClick={() => handleEquipItem('hat', hat.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                        isEquipped
                          ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-4xl mb-2">{hat.iconType}</span>
                      <span className="text-xs font-semibold text-white truncate w-full mb-1">{hat.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {isOwned ? 'Owned' : `${hat.price} R$`}
                      </span>
                      {isEquipped && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ACCESSORIES */}
          {activeTab === 'accessories' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Equip back gears, wings, and mythical swords.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATALOG_ITEMS.filter((i) => i.category === 'accessory').map((acc) => {
                  const isEquipped = equipped.accessory === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleEquipItem('accessory', acc.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                        isEquipped
                          ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-4xl mb-2">{acc.iconType}</span>
                      <span className="text-xs font-semibold text-white truncate w-full mb-1">{acc.name}</span>
                      <span className="text-[11px] text-cyan-400">{acc.price} R$</span>
                      {isEquipped && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FACES */}
          {activeTab === 'faces' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Change your avatar face expression in real time.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATALOG_ITEMS.filter((i) => i.category === 'face').map((face) => {
                  const isEquipped = equipped.face === face.id;
                  return (
                    <div
                      key={face.id}
                      onClick={() => handleEquipItem('face', face.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                        isEquipped
                          ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-4xl mb-2">{face.iconType}</span>
                      <span className="text-xs font-semibold text-white truncate w-full mb-1">{face.name}</span>
                      <span className="text-[11px] text-slate-400">{face.isFree ? 'Free' : `${face.price} R$`}</span>
                      {isEquipped && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

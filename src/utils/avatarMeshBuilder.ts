import * as THREE from 'three';
import { AvatarColors } from '../types';

export interface CharacterRig {
  root: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArmMesh: THREE.Mesh;
  rightArmMesh: THREE.Mesh;
  leftLegMesh: THREE.Mesh;
  rightLegMesh: THREE.Mesh;
  hatGroup: THREE.Group;
  accessoryGroup: THREE.Group;
}

export function createFaceTexture(faceType: string = 'smile'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill transparent or skin background
    ctx.clearRect(0, 0, 256, 256);

    ctx.fillStyle = '#111216';
    ctx.strokeStyle = '#111216';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    if (faceType === 'chill') {
      // Cool relaxed half-eyes
      ctx.beginPath();
      ctx.moveTo(55, 95);
      ctx.lineTo(105, 95);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(80, 105, 14, 0, Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(151, 95);
      ctx.lineTo(201, 95);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(176, 105, 14, 0, Math.PI);
      ctx.fill();

      // Confident smirk
      ctx.beginPath();
      ctx.arc(140, 165, 45, 0.2, Math.PI * 0.85);
      ctx.stroke();
    } else {
      // Classic Roblox 2-dot big smile
      // Left eye
      ctx.beginPath();
      ctx.arc(75, 95, 16, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.arc(181, 95, 16, 0, Math.PI * 2);
      ctx.fill();

      // Big joyful curve mouth
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(128, 140, 52, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildRobloxCharacter(
  colors: AvatarColors,
  equipped: {
    hat?: string;
    face?: string;
    shirt?: string;
    accessory?: string;
  }
): CharacterRig {
  const root = new THREE.Group();

  // Materials
  const headMat = new THREE.MeshStandardMaterial({
    color: colors.head,
    roughness: 0.35,
    metalness: 0.05,
  });

  const torsoMat = new THREE.MeshStandardMaterial({
    color: colors.torso,
    roughness: 0.4,
    metalness: 0.05,
  });

  const leftArmMat = new THREE.MeshStandardMaterial({
    color: colors.leftArm,
    roughness: 0.4,
  });

  const rightArmMat = new THREE.MeshStandardMaterial({
    color: colors.rightArm,
    roughness: 0.4,
  });

  const leftLegMat = new THREE.MeshStandardMaterial({
    color: colors.leftLeg,
    roughness: 0.4,
  });

  const rightLegMat = new THREE.MeshStandardMaterial({
    color: colors.rightLeg,
    roughness: 0.4,
  });

  // Torso: 2.0 width x 2.0 height x 1.0 depth
  const torsoGeo = new THREE.BoxGeometry(2.0, 2.0, 1.0);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 2.0; // Center at y=2
  torso.castShadow = true;
  torso.receiveShadow = true;
  root.add(torso);

  // Head: 1.25 x 1.25 x 1.25 box or beveled cylinder
  const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const faceTexture = createFaceTexture(equipped.face === 'face-chill' ? 'chill' : 'smile');
  
  // Materials array for box: [right, left, top, bottom, front, back]
  const headMaterials = [
    headMat,
    headMat,
    headMat,
    headMat,
    new THREE.MeshStandardMaterial({
      color: colors.head,
      map: faceTexture,
      roughness: 0.35,
    }),
    headMat,
  ];
  const head = new THREE.Mesh(headGeo, headMaterials);
  head.position.set(0, 1.6, 0); // Relative to torso
  head.castShadow = true;
  torso.add(head);

  // Stud on top of head (classic Roblox stud)
  const studGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
  const stud = new THREE.Mesh(studGeo, headMat);
  stud.position.y = 0.7;
  head.add(stud);

  // Hat Group
  const hatGroup = new THREE.Group();
  head.add(hatGroup);
  attachHat(hatGroup, equipped.hat);

  // Accessory Group (e.g. wings, katana)
  const accessoryGroup = new THREE.Group();
  torso.add(accessoryGroup);
  attachAccessory(accessoryGroup, equipped.accessory);

  // Left Arm (pivot at top shoulder: x = -1.5, y = 0.9 relative to torso)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-1.5, 0.9, 0);
  const armGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
  const leftArmMesh = new THREE.Mesh(armGeo, leftArmMat);
  leftArmMesh.position.set(0, -0.9, 0); // Offset down from shoulder pivot
  leftArmMesh.castShadow = true;
  leftArmGroup.add(leftArmMesh);
  torso.add(leftArmGroup);

  // Right Arm (pivot at top shoulder: x = 1.5, y = 0.9 relative to torso)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(1.5, 0.9, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, rightArmMat);
  rightArmMesh.position.set(0, -0.9, 0);
  rightArmMesh.castShadow = true;
  rightArmGroup.add(rightArmMesh);
  torso.add(rightArmGroup);

  // Left Leg (pivot at hip: x = -0.5, y = -1.0 relative to torso)
  const legGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.5, -1.0, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, leftLegMat);
  leftLegMesh.position.set(0, -1.0, 0);
  leftLegMesh.castShadow = true;
  leftLegGroup.add(leftLegMesh);
  torso.add(leftLegGroup);

  // Right Leg (pivot at hip: x = 0.5, y = -1.0 relative to torso)
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.5, -1.0, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, rightLegMat);
  rightLegMesh.position.set(0, -1.0, 0);
  rightLegMesh.castShadow = true;
  rightLegGroup.add(rightLegMesh);
  torso.add(rightLegGroup);

  return {
    root,
    torso,
    head,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
    leftArmMesh,
    rightArmMesh,
    leftLegMesh,
    rightLegMesh,
    hatGroup,
    accessoryGroup,
  };
}

function attachHat(container: THREE.Group, hatId?: string) {
  while (container.children.length > 0) {
    container.remove(container.children[0]);
  }
  if (!hatId || hatId === 'none') return;

  if (hatId === 'fedora-1') {
    // Fedora Hat
    const fedora = new THREE.Group();
    // Brim
    const brimGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.08, 24);
    const darkFeltMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const brim = new THREE.Mesh(brimGeo, darkFeltMat);
    brim.position.y = 0.65;
    brim.rotation.x = 0.05;
    fedora.add(brim);

    // Crown
    const crownGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.6, 24);
    const crown = new THREE.Mesh(crownGeo, darkFeltMat);
    crown.position.y = 0.95;
    crown.rotation.x = 0.05;
    fedora.add(crown);

    // Crimson Band
    const bandGeo = new THREE.CylinderGeometry(0.86, 0.86, 0.12, 24);
    const redBandMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const band = new THREE.Mesh(bandGeo, redBandMat);
    band.position.y = 0.73;
    band.rotation.x = 0.05;
    fedora.add(band);

    container.add(fedora);
  } else if (hatId === 'hat-valkyrie') {
    // Valkyrie Helm
    const valk = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xdfab2a, metalness: 0.8, roughness: 0.2 });
    const helmGeo = new THREE.SphereGeometry(0.72, 16, 16);
    const helm = new THREE.Mesh(helmGeo, goldMat);
    helm.position.y = 0.35;
    valk.add(helm);

    // Left Wing
    const wingGeo = new THREE.BoxGeometry(0.12, 0.9, 0.45);
    const leftWing = new THREE.Mesh(wingGeo, goldMat);
    leftWing.position.set(-0.75, 0.9, 0);
    leftWing.rotation.z = -0.35;
    leftWing.rotation.y = 0.2;
    valk.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(wingGeo, goldMat);
    rightWing.position.set(0.75, 0.9, 0);
    rightWing.rotation.z = 0.35;
    rightWing.rotation.y = -0.2;
    valk.add(rightWing);

    container.add(valk);
  } else if (hatId === 'hat-crown') {
    // Gold Crown
    const crown = new THREE.Group();
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.15 });
    const circletGeo = new THREE.CylinderGeometry(0.75, 0.72, 0.4, 8);
    const circlet = new THREE.Mesh(circletGeo, crownMat);
    circlet.position.y = 0.8;
    crown.add(circlet);

    // Jewels
    const jewelGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const jewelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.1 });
    const jewel = new THREE.Mesh(jewelGeo, jewelMat);
    jewel.position.set(0, 0.95, 0.72);
    crown.add(jewel);

    container.add(crown);
  } else if (hatId === 'hat-headphones') {
    // DJ Headphones
    const hp = new THREE.Group();
    const neonPinkMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
    const darkBandMat = new THREE.MeshStandardMaterial({ color: 0x1e1e24 });

    // Arch band
    const archGeo = new THREE.TorusGeometry(0.78, 0.08, 8, 16, Math.PI);
    const arch = new THREE.Mesh(archGeo, darkBandMat);
    arch.position.y = 0.5;
    arch.rotation.z = Math.PI;
    hp.add(arch);

    // Left Ear cup
    const cupGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16);
    const leftCup = new THREE.Mesh(cupGeo, neonPinkMat);
    leftCup.position.set(-0.72, 0.0, 0);
    leftCup.rotation.z = Math.PI / 2;
    hp.add(leftCup);

    // Right Ear cup
    const rightCup = new THREE.Mesh(cupGeo, neonPinkMat);
    rightCup.position.set(0.72, 0.0, 0);
    rightCup.rotation.z = Math.PI / 2;
    hp.add(rightCup);

    container.add(hp);
  }
}

function attachAccessory(container: THREE.Group, accId?: string) {
  while (container.children.length > 0) {
    container.remove(container.children[0]);
  }
  if (!accId || accId === 'none') return;

  if (accId === 'acc-wings') {
    // Neon Cyber Wings
    const wings = new THREE.Group();
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    const wingShape = new THREE.BoxGeometry(1.6, 0.7, 0.08);

    const leftWing = new THREE.Mesh(wingShape, cyanMat);
    leftWing.position.set(-1.2, 0.3, -0.6);
    leftWing.rotation.set(0.1, 0.3, 0.35);
    wings.add(leftWing);

    const rightWing = new THREE.Mesh(wingShape, cyanMat);
    rightWing.position.set(1.2, 0.3, -0.6);
    rightWing.rotation.set(0.1, -0.3, -0.35);
    wings.add(rightWing);

    container.add(wings);
  } else if (accId === 'acc-katana') {
    // Back Katana
    const katana = new THREE.Group();
    const bladeSheathMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 });
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });

    // Sheath cylinder
    const sheathGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8);
    const sheath = new THREE.Mesh(sheathGeo, bladeSheathMat);
    sheath.position.set(0, 0.2, -0.65);
    sheath.rotation.z = -0.7;
    katana.add(sheath);

    // Hilt
    const hiltGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8);
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.set(0.95, 1.25, -0.65);
    hilt.rotation.z = -0.7;
    katana.add(hilt);

    container.add(katana);
  }
}

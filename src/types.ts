export type NavigationTab = 'discover' | 'marketplace' | 'create' | 'robux' | 'avatar' | 'profile' | 'inventory';

export type BodyPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

export interface AvatarColors {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: 'hat' | 'face' | 'shirt' | 'accessory' | 'bundle';
  price: number;
  isLimited?: boolean;
  isFree?: boolean;
  color?: string;
  description: string;
  iconType: string;
  meshType?: 'fedora' | 'valkyrie' | 'dominus' | 'wings' | 'katana' | 'crown' | 'headphones' | 'smile' | 'chill' | 'hoodie' | 'ninja';
  stats?: {
    favorites: string;
    owners: string;
  };
}

export interface GameExperience {
  id: string;
  title: string;
  category: 'Obby' | 'Action' | 'Roleplay' | 'Racing' | 'Anime' | 'Horror';
  creator: string;
  ratingPercent: number;
  activePlayers: string;
  visits: string;
  image: string;
  description: string;
  isPlayable3D: boolean;
  gameMode?: 'obby' | 'blade_ball' | 'speed_run';
  gamepasses: {
    id: string;
    title: string;
    price: number;
    perk: string;
  }[];
  servers: {
    id: string;
    players: number;
    maxPlayers: number;
    ping: number;
  }[];
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  status: 'online' | 'in-game' | 'offline';
  currentGame?: string;
  gameId?: string;
}

export interface UserProfileData {
  username: string;
  displayName: string;
  joinDate: string;
  robux: number;
  friendsCount: number;
  followersCount: number;
  avatarColors: AvatarColors;
  equippedItems: {
    hat?: string;
    face?: string;
    shirt?: string;
    accessory?: string;
  };
  inventoryIds: string[];
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
}

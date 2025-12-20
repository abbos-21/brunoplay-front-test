export interface User {
  id: number
  telegramId: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  languageCode?: string | null
  isBot: boolean
  createdAt: string
  updatedAt: string

  totalCoins: number
  coins: number
  level: number
  miningRate: number

  referredById: number | null
  referredBy?: User | null
  referrals?: User[]

  rewardedLevels: string
  referralEarnings: number

  lastMiningTick: string | null
  isMining: boolean
  tempCoins: number
  vaultCapacity: number

  currentHealth: number
  maxHealth: number

  currentEnergy: number
  maxEnergy: number

  healthPerSecond: number
  energyPerSecond: number

  vaultLevel: number
  miningRateLevel: number
  energyLevel: number
  healthLevel: number

  lastWheelSpin: string | null

  withdrawals: Withdrawal[]
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export type UserDataResponse = {
  user: User
}

export type AuthResponseData = {
  token: string
  user: User
}
export type AuthApiResponse = ApiResponse<AuthResponseData>

export type GameStartMiningResponseData = UserDataResponse
export type GameStartMiningApiResponse = ApiResponse<GameStartMiningResponseData>

export type GameStopMiningResponseData = UserDataResponse
export type GameStopMiningApiResponse = ApiResponse<GameStopMiningResponseData>

export type GameSyncResponseData = UserDataResponse
export type GameSyncApiResponse = ApiResponse<GameSyncResponseData>

export type GameCollectCoinsResponseData = UserDataResponse & {
  coinsCollected: number
}
export type GameCollectCoinsApiResponse = ApiResponse<GameCollectCoinsResponseData>

export type GameRecoveryResponseData = UserDataResponse
export type GameRecoveryApiResponse = ApiResponse<GameRecoveryResponseData>

export interface GameSpinWheelStatusApiResponse {
  success: boolean
  data: {
    canSpin: boolean
    remaining: {
      hours: number
      minutes: number
      seconds: number
    }
    lastWheelSpin: string
  }
}

export interface GameSpinWheelSpinApiResponse {
  success: boolean
  data: {
    prize: number
    nextSpinAt: string
  }
}

export interface AdResponse {
  text_html: string
  click_url: string
  button_name: string
  image_url: string
  button_reward_name: string
  reward_url: string
}

export interface InviteLinkResponse {
  link: string
}

export interface ReferralsResponse {
  count: number
  referralEarnings: number
  referralRewards: {
    [referrals: number]: number
  }
  referrals?: User[]
}

export interface UpgradeStatusItem {
  name: 'wealth' | 'work' | 'food' | 'immune'
  level: number
  maxLevel: number
  cost: number | null
  canUpgrade: boolean
  effect: string
  description: string
  details: string
}

export interface UpgradeStatusData {
  status: UpgradeStatusItem[]
}

export type UpgradeStatusApiResponse = ApiResponse<UpgradeStatusData>

export interface UpgradeResponse {
  user: User
  spent: number
  newValue: number
}

export type UpgradeApiResponse = ApiResponse<UpgradeResponse>

export interface Withdrawal {
  id: number
  userId: number

  createdAt: Date
  updatedAt: Date

  status: 'PENDING' | 'COMPLETED' | 'FAILED'

  amountCoins: number
  amountTon: number

  targetAddress: string

  txHash?: string | null
  errorMessage?: string | null

  user?: User
}

export interface WithdrawalHistoryResponse {
  withdrawals: Withdrawal[]
}

export interface WithdrawalDataResponse {
  rate: number
  min: number
  max: number
}

export type WithdrawalDataApiResponse = ApiResponse<WithdrawalDataResponse>

export interface WithdrawalRequestBody {
  amountCoins: number
  targetAddress: string
}

export interface WithdrawalResponse {
  withdrawal: Withdrawal
}

export type WithdrawalApiResponse = ApiResponse<WithdrawalResponse>

export interface TasksResponse {
  tasks: string[]
}

export type TasksApiResponse = ApiResponse<TasksResponse>

export interface LeaderboardResponse {
  users: User[]
}

export interface BlockListResponse {
  users: User[]
}

export interface Season {
  id: number
  name: string
  start: string
  end: string
}

export interface SeasonResponse {
  season: Season
  timeLeft: {
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  }
}

export interface ApiError {
  response: {
    data: {
      message: string
      success: boolean
    }
  }
}

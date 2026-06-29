// EXPORTS: IHomePageFeature, IHomePageBank, MOCK_HOME_FEATURES, MOCK_HOME_BANKS
export interface IHomePageFeature {
  id: string
  name: string
  iconKey: string
  action: 'practice' | 'exam' | 'challenge' | 'reset' | 'search' | 'update' | 'create' | 'share'
  imageUrl: string
}

export interface IHomePageBank {
  id: string
  name: string
  questionCount: number
  lastPracticeAt?: string
  correctRate: number
  imageUrl: string
}

export const MOCK_HOME_FEATURES: IHomePageFeature[] = [
  {
    id: '1',
    name: '开始刷题',
    iconKey: 'Pencil',
    action: 'practice',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkid56hl2mg_ve_miaoda',
  },
  {
    id: '2',
    name: '模拟考试',
    iconKey: 'Clipboard',
    action: 'exam',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkidbfm6sjq_ve_miaoda',
  },
  {
    id: '3',
    name: '巅峰挑战',
    iconKey: 'Swords',
    action: 'challenge',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkid56hlwdg_ve_miaoda',
  },
  {
    id: '4',
    name: '重新刷题',
    iconKey: 'Refresh',
    action: 'reset',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkidnx324lq_ve_miaoda',
  },
  {
    id: '5',
    name: '题目搜索',
    iconKey: 'Search',
    action: 'search',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkid7mfm6dq_ve_miaoda',
  },
  {
    id: '6',
    name: '更新题目',
    iconKey: 'Repeat',
    action: 'update',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkidl3caigg_ve_miaoda',
  },
  {
    id: '7',
    name: '创建题库',
    iconKey: 'FolderPlus',
    action: 'create',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkidl3caigg_ve_miaoda',
  },
  {
    id: '8',
    name: '分享题库',
    iconKey: 'Share',
    action: 'share',
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkiee2uaceo_ve_miaoda',
  },
]

export const MOCK_HOME_BANKS: IHomePageBank[] = [
  {
    id: '1',
    name: '计算机基础题库',
    questionCount: 20,
    lastPracticeAt: '今天 14:30',
    correctRate: 75,
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkid5ovgmbo_ve_miaoda',
  },
  {
    id: '2',
    name: '职业资格认证',
    questionCount: 120,
    lastPracticeAt: '昨天',
    correctRate: 62,
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkid56hlwcg_ve_miaoda',
  },
  {
    id: '3',
    name: '学历考试真题',
    questionCount: 300,
    correctRate: 0,
    imageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkidt7v3idi_ve_miaoda',
  },
]
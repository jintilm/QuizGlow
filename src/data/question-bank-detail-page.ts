// EXPORTS: IQuestion, IChapter, MOCK_QUESTIONS, MOCK_CHAPTERS
export interface IQuestion {
  id: string
  bankId: string
  type: 'single' | 'multiple' | 'judge' | 'fill' | 'essay'
  chapter: string
  stem: string
  options?: { key: string; content: string }[]
  answer: string | string[]
  analysis?: string
  status: 'unattempted' | 'correct' | 'wrong'
  source: 'mock' | 'imported'
}

export interface IChapter {
  id: string
  name: string
  questionCount: number
}

export const MOCK_CHAPTERS: IChapter[] = [
  { id: '1', name: '操作系统概述', questionCount: 8 },
  { id: '2', name: '进程管理', questionCount: 7 },
  { id: '3', name: '内存管理', questionCount: 5 },
]

export const MOCK_QUESTIONS: IQuestion[] = [
  {
    id: '1',
    bankId: 'bank_1',
    type: 'single',
    chapter: '操作系统概述',
    stem: '在计算机系统中，操作系统是（ ）。',
    options: [
      { key: 'A', content: '一般应用软件' },
      { key: 'B', content: '核心系统软件' },
      { key: 'C', content: '用户应用软件' },
      { key: 'D', content: '系统支撑软件' },
    ],
    answer: 'B',
    analysis: '操作系统是管理计算机硬件与软件资源的核心系统软件。',
    status: 'correct',
    source: 'mock',
  },
  {
    id: '2',
    bankId: 'bank_1',
    type: 'multiple',
    chapter: '进程管理',
    stem: '进程的基本状态包括以下哪些？',
    options: [
      { key: 'A', content: '就绪状态' },
      { key: 'B', content: '运行状态' },
      { key: 'C', content: '阻塞状态' },
      { key: 'D', content: '终止状态' },
    ],
    answer: ['A', 'B', 'C'],
    analysis: '进程三态模型包括就绪、运行、阻塞三种基本状态。',
    status: 'wrong',
    source: 'mock',
  },
  {
    id: '3',
    bankId: 'bank_1',
    type: 'judge',
    chapter: '内存管理',
    stem: '虚拟内存技术可以扩大物理内存容量。',
    answer: '错误',
    analysis: '虚拟内存是利用磁盘空间扩展逻辑内存，不改变物理内存容量。',
    status: 'unattempted',
    source: 'mock',
  },
]
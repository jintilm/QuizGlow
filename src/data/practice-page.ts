// EXPORTS: IPracticeQuestion, MOCK_PRACTICE_QUESTIONS
export interface IPracticeQuestion {
  id: string
  bankId: string
  type: 'single' | 'multiple' | 'judge' | 'fill' | 'essay'
  chapter: string
  stem: string
  options?: { key: string; content: string }[]
  answer: string | string[]
  analysis?: string
  isFavorite: boolean
  hasNote: boolean
  noteContent?: string
}

export const MOCK_PRACTICE_QUESTIONS: IPracticeQuestion[] = [
  {
    id: '1',
    bankId: 'bank-1',
    type: 'single',
    chapter: '第一章：操作系统概述',
    stem: '在计算机系统中，操作系统是（ ）。',
    options: [
      { key: 'A', content: '一般应用软件' },
      { key: 'B', content: '核心系统软件' },
      { key: 'C', content: '用户应用软件' },
      { key: 'D', content: '系统支撑软件' },
    ],
    answer: 'B',
    analysis: '操作系统是管理计算机硬件与软件资源的核心系统软件，是计算机系统的核心与基石。',
    isFavorite: false,
    hasNote: false,
  },
  {
    id: '2',
    bankId: 'bank-1',
    type: 'multiple',
    chapter: '第一章：操作系统概述',
    stem: '以下属于操作系统基本功能的有（ ）。',
    options: [
      { key: 'A', content: '进程管理' },
      { key: 'B', content: '内存管理' },
      { key: 'C', content: '文件管理' },
      { key: 'D', content: '设备管理' },
    ],
    answer: ['A', 'B', 'C', 'D'],
    analysis: '操作系统的基本功能包括进程管理、内存管理、文件管理、设备管理和作业管理五大功能。',
    isFavorite: true,
    hasNote: true,
    noteContent: '五大功能口诀：进设文存作',
  },
  {
    id: '3',
    bankId: 'bank-1',
    type: 'judge',
    chapter: '第一章：操作系统概述',
    stem: '操作系统是一种应用软件。',
    answer: '错误',
    analysis: '操作系统是系统软件，不是应用软件。它负责管理硬件资源，为应用软件提供运行环境。',
    isFavorite: false,
    hasNote: false,
  },
]
// EXPORTS: IQuestion, MOCK_QUESTIONS, MOCK_BANK_INFO
export interface IQuestion {
  id: string
  bankId: string
  type: 'single' | 'multiple' | 'judge' | 'fill' | 'essay'
  chapter: string
  stem: string
  options?: { key: string; content: string }[]
  answer: string | string[]
  analysis?: string
  source: 'mock' | 'imported'
  createdAt: number
}

export interface IMockBankInfo {
  id: string
  name: string
  description: string
  questionCount: number
  chapters: string[]
  createdAt: number
  lastPracticeAt?: number
  correctRate?: number
  source: 'mock'
}

const NOW = Date.now()

export const MOCK_BANK_INFO: IMockBankInfo = {
  id: 'mock-bank-1',
  name: '计算机基础通关题库',
  description: '涵盖操作系统、计算机网络、数据结构等核心考点，适合备考复习',
  questionCount: 20,
  chapters: ['操作系统概述', '进程管理', '计算机网络基础', '数据结构入门'],
  createdAt: NOW,
  lastPracticeAt: NOW - 86400000 * 2,
  correctRate: 0.72,
  source: 'mock',
}

const BANK_ID = 'mock-bank-1'

export const MOCK_QUESTIONS: IQuestion[] = [
  // ===== 操作系统概述 - 单选题 =====
  {
    id: 'q-1',
    bankId: BANK_ID,
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
    analysis: '操作系统是管理计算机硬件与软件资源的核心系统软件，也是计算机系统的内核与基石。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-2',
    bankId: BANK_ID,
    type: 'single',
    chapter: '操作系统概述',
    stem: '操作系统的基本功能不包括以下哪项？',
    options: [
      { key: 'A', content: '进程管理' },
      { key: 'B', content: '内存管理' },
      { key: 'C', content: '文档编辑' },
      { key: 'D', content: '文件管理' },
    ],
    answer: 'C',
    analysis: '操作系统的五大基本功能包括：进程管理、内存管理、设备管理、文件管理和作业管理。文档编辑属于应用软件的功能。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-3',
    bankId: BANK_ID,
    type: 'multiple',
    chapter: '操作系统概述',
    stem: '以下属于操作系统的有（ ）。',
    options: [
      { key: 'A', content: 'Windows' },
      { key: 'B', content: 'Linux' },
      { key: 'C', content: 'Office' },
      { key: 'D', content: 'macOS' },
    ],
    answer: ['A', 'B', 'D'],
    analysis: 'Windows、Linux、macOS 都是操作系统。Office 是办公应用软件，运行在操作系统之上。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-4',
    bankId: BANK_ID,
    type: 'judge',
    chapter: '操作系统概述',
    stem: '操作系统是计算机硬件与用户之间的接口。',
    answer: '正确',
    analysis: '操作系统是管理和控制计算机硬件与软件资源的计算机程序，它为用户提供了一个与硬件交互的接口。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-5',
    bankId: BANK_ID,
    type: 'fill',
    chapter: '操作系统概述',
    stem: '操作系统的三大基本特征是并发、共享和______。',
    answer: '异步性',
    analysis: '操作系统的三大基本特征：并发（多个程序同时运行）、共享（资源被多个进程共享）、异步性（进程以不可预知的速度向前推进）。',
    source: 'mock',
    createdAt: NOW,
  },

  // ===== 进程管理 =====
  {
    id: 'q-6',
    bankId: BANK_ID,
    type: 'single',
    chapter: '进程管理',
    stem: '进程和线程的主要区别是（ ）。',
    options: [
      { key: 'A', content: '进程是资源分配的基本单位，线程是CPU调度的基本单位' },
      { key: 'B', content: '线程是资源分配的基本单位，进程是CPU调度的基本单位' },
      { key: 'C', content: '进程和线程都是资源分配的基本单位' },
      { key: 'D', content: '进程和线程都是CPU调度的基本单位' },
    ],
    answer: 'A',
    analysis: '进程是操作系统进行资源分配的基本单位，线程是CPU调度和执行的基本单位。一个进程可以包含多个线程。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-7',
    bankId: BANK_ID,
    type: 'single',
    chapter: '进程管理',
    stem: '进程的三种基本状态不包括（ ）。',
    options: [
      { key: 'A', content: '就绪状态' },
      { key: 'B', content: '运行状态' },
      { key: 'C', content: '阻塞状态' },
      { key: 'D', content: '终止状态' },
    ],
    answer: 'D',
    analysis: '进程的三种基本状态是：就绪态、运行态、阻塞态（等待态）。终止状态是进程生命周期的结束状态，不属于三种基本状态。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-8',
    bankId: BANK_ID,
    type: 'multiple',
    chapter: '进程管理',
    stem: '进程调度算法包括以下哪些？',
    options: [
      { key: 'A', content: '先来先服务（FCFS）' },
      { key: 'B', content: '短作业优先（SJF）' },
      { key: 'C', content: '时间片轮转（RR）' },
      { key: 'D', content: '优先级调度' },
    ],
    answer: ['A', 'B', 'C', 'D'],
    analysis: '常见的进程调度算法包括：先来先服务、短作业优先、时间片轮转、优先级调度、多级反馈队列等。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-9',
    bankId: BANK_ID,
    type: 'judge',
    chapter: '进程管理',
    stem: '死锁是指多个进程因竞争资源而造成的一种僵局，若无外力作用，这些进程都将永远不能向前推进。',
    answer: '正确',
    analysis: '死锁是指两个或两个以上的进程在执行过程中，因争夺资源而造成的一种互相等待的现象。死锁的四个必要条件：互斥、请求与保持、不剥夺、循环等待。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-10',
    bankId: BANK_ID,
    type: 'essay',
    chapter: '进程管理',
    stem: '简述死锁产生的四个必要条件。',
    answer: '死锁产生的四个必要条件：\n1. 互斥条件：资源不能被共享，只能由一个进程使用。\n2. 请求与保持条件：进程已获得至少一个资源，又提出新的资源请求，而该资源已被其他进程占有。\n3. 不剥夺条件：进程已获得的资源在未使用完之前，不能被剥夺。\n4. 循环等待条件：存在一个进程资源的循环等待链。',
    analysis: '四个条件缺一不可，破坏其中任意一个条件即可预防死锁。',
    source: 'mock',
    createdAt: NOW,
  },

  // ===== 计算机网络基础 =====
  {
    id: 'q-11',
    bankId: BANK_ID,
    type: 'single',
    chapter: '计算机网络基础',
    stem: 'OSI七层参考模型中，位于最底层的是（ ）。',
    options: [
      { key: 'A', content: '网络层' },
      { key: 'B', content: '数据链路层' },
      { key: 'C', content: '物理层' },
      { key: 'D', content: '传输层' },
    ],
    answer: 'C',
    analysis: 'OSI七层模型从下到上依次是：物理层、数据链路层、网络层、传输层、会话层、表示层、应用层。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-12',
    bankId: BANK_ID,
    type: 'single',
    chapter: '计算机网络基础',
    stem: 'TCP/IP协议中，属于传输层的协议是（ ）。',
    options: [
      { key: 'A', content: 'HTTP' },
      { key: 'B', content: 'TCP' },
      { key: 'C', content: 'IP' },
      { key: 'D', content: 'ARP' },
    ],
    answer: 'B',
    analysis: 'TCP和UDP是传输层协议。HTTP是应用层协议，IP是网络层协议，ARP是数据链路层协议。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-13',
    bankId: BANK_ID,
    type: 'multiple',
    chapter: '计算机网络基础',
    stem: '以下属于应用层协议的有（ ）。',
    options: [
      { key: 'A', content: 'HTTP' },
      { key: 'B', content: 'FTP' },
      { key: 'C', content: 'SMTP' },
      { key: 'D', content: 'DNS' },
    ],
    answer: ['A', 'B', 'C', 'D'],
    analysis: 'HTTP（超文本传输）、FTP（文件传输）、SMTP（邮件传输）、DNS（域名解析）都属于应用层协议。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-14',
    bankId: BANK_ID,
    type: 'judge',
    chapter: '计算机网络基础',
    stem: 'TCP是面向连接的可靠传输协议，UDP是无连接的不可靠传输协议。',
    answer: '正确',
    analysis: 'TCP提供面向连接的、可靠的、基于字节流的传输服务；UDP提供无连接的、不可靠的数据报传输服务，但传输效率更高。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-15',
    bankId: BANK_ID,
    type: 'fill',
    chapter: '计算机网络基础',
    stem: 'IP地址由______位二进制数组成，通常分为网络号和主机号两部分。',
    answer: '32',
    analysis: 'IPv4地址由32位二进制数组成，通常用点分十进制表示。IPv6地址由128位二进制数组成。',
    source: 'mock',
    createdAt: NOW,
  },

  // ===== 数据结构入门 =====
  {
    id: 'q-16',
    bankId: BANK_ID,
    type: 'single',
    chapter: '数据结构入门',
    stem: '栈的特点是（ ）。',
    options: [
      { key: 'A', content: '先进先出' },
      { key: 'B', content: '后进先出' },
      { key: 'C', content: '随机存取' },
      { key: 'D', content: '顺序存取' },
    ],
    answer: 'B',
    analysis: '栈是一种后进先出（LIFO）的线性表，只允许在栈顶进行插入和删除操作。队列是先进先出（FIFO）。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-17',
    bankId: BANK_ID,
    type: 'single',
    chapter: '数据结构入门',
    stem: '二叉树的前序遍历顺序是（ ）。',
    options: [
      { key: 'A', content: '左子树 → 根节点 → 右子树' },
      { key: 'B', content: '根节点 → 左子树 → 右子树' },
      { key: 'C', content: '左子树 → 右子树 → 根节点' },
      { key: 'D', content: '根节点 → 右子树 → 左子树' },
    ],
    answer: 'B',
    analysis: '前序遍历：根→左→右；中序遍历：左→根→右；后序遍历：左→右→根。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-18',
    bankId: BANK_ID,
    type: 'multiple',
    chapter: '数据结构入门',
    stem: '以下属于线性数据结构的有（ ）。',
    options: [
      { key: 'A', content: '数组' },
      { key: 'B', content: '链表' },
      { key: 'C', content: '栈' },
      { key: 'D', content: '二叉树' },
    ],
    answer: ['A', 'B', 'C'],
    analysis: '线性结构包括：数组、链表、栈、队列等。二叉树属于非线性结构。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-19',
    bankId: BANK_ID,
    type: 'judge',
    chapter: '数据结构入门',
    stem: '快速排序的平均时间复杂度是O(nlogn)。',
    answer: '正确',
    analysis: '快速排序的平均时间复杂度为O(nlogn)，最坏情况为O(n²)。它是一种分治算法，通过选择基准元素进行划分。',
    source: 'mock',
    createdAt: NOW,
  },
  {
    id: 'q-20',
    bankId: BANK_ID,
    type: 'essay',
    chapter: '数据结构入门',
    stem: '请比较数组和链表的优缺点。',
    answer: '数组的优点：\n1. 随机访问效率高，时间复杂度O(1)\n2. 内存连续，缓存命中率高\n数组的缺点：\n1. 插入和删除效率低，需要移动大量元素\n2. 大小固定，不能动态扩展\n\n链表的优点：\n1. 插入和删除效率高，只需修改指针\n2. 大小动态，可灵活扩展\n链表的缺点：\n1. 不能随机访问，查找效率低O(n)\n2. 需要额外空间存储指针',
    analysis: '数组适合读多写少、已知大小的场景；链表适合写多读少、大小不确定的场景。',
    source: 'mock',
    createdAt: NOW,
  },
]
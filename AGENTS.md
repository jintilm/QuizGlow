# 智能题库识别与在线答题应用 - 需求拆解文档

## 产品概述

- **产品类型**: 教育类工具应用（题库识别 + 在线刷题）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 需要备考刷题、自建题库的学习者（学生、考证人群、职业培训学员）
- **核心价值**: 支持上传 Word/PDF 文档，自动智能识别题目并转化为在线答题形式，提供多种刷题模式与个性化设置，提升备考效率
- **界面语言**: 中文
- **主题偏好**: user_specified（支持深色/浅色主题切换，玻璃拟态风格）
- **导航模式**: 路径导航
- **导航布局**: Topbar（消费者前台，移动端优先的响应式布局）

---

## 页面结构总览

> **说明**：应用围绕"题库管理 → 题目识别 → 答题练习"的核心任务流展开，共 4 个一级页面 + 2 个二级页面

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 题库首页 | `HomePage.tsx` | `/` | 一级 | 导航 |
| 题目识别 | `ImportPage.tsx` | `/import` | 一级 | 导航 / 题库首页 → 创建题库流程 |
| 题库详情 | `QuestionBankDetailPage.tsx` | `/bank/:id` | 二级 | 题库首页 → 点击题库卡片 |
| 答题练习 | `PracticePage.tsx` | `/practice/:id` | 二级 | 题库详情 → 开始刷题/模拟考试/巅峰挑战 |
| 题目搜索 | `SearchPage.tsx` | `/search` | 一级 | 导航 |
| 我的收藏/笔记 | `FavoritesPage.tsx` | `/favorites` | 一级 | 导航 |

---

## 页面布局建议

### 题库首页 (HomePage)
- **布局模式**: 上下分区 + 卡片网格
- **视觉重心**: 功能入口网格（8 宫格功能区） + 题库列表
- **结果承载区**: 题库列表卡片；初始态为示例题库（含 mock 示例数据）

### 题目识别 (ImportPage)
- **布局模式**: 左右分栏（桌面端）/ 上下堆叠（移动端）
- **视觉重心**: 左侧上传区 + 右侧识别结果预览编辑区
- **源材料承载区**: 左侧文件上传与文档预览；**结果承载区**: 右侧识别题目列表，支持逐题编辑、题型修正、确认导入
- **初始态**: 上传引导态（拖拽上传区 + 格式说明）

### 题库详情 (QuestionBankDetailPage)
- **布局模式**: 主从布局（左侧章节/分类树 + 右侧题目列表）
- **视觉重心**: 题目列表与章节导航
- **结果承载区**: 题目列表；初始态加载当前题库全部题目

### 答题练习 (PracticePage)
- **布局模式**: 单栏居中 + 底部导航
- **视觉重心**: 题目内容区（题干 + 选项 + 答案解析）
- **结果承载区**: 答题进度条 + 答案解析展开区；初始态为第一题加载状态

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| doc-parser-word-pdf | `ai-doc-parser` | 解析用户上传的 Word/PDF 文档内容，提取纯文本 | unary | 题目识别页 |
| question-extractor | `ai-text-to-json` | 将文档文本中智能识别题目，提取题型、题干、选项、答案、解析等结构化字段 | unary | 题目识别页 |

> **说明**: 文档识别采用两阶段流程：先通过 `ai-doc-parser` 提取文档文本内容，再通过 `ai-text-to-json` 从文本中结构化提取题目信息。两阶段链式调用。

---

## 导航配置

- **导航布局**: Topbar（顶部导航栏，移动端底部 Tab 导航）
- **导航项**（一级页面）:

| 导航文字 | 路由 | 图标 |
|---------|------|------|
| 题库 | `/` | Home |
| 导入 | `/import` | Upload |
| 搜索 | `/search` | Search |
| 收藏 | `/favorites` | Heart |

> 移动端采用底部 Tab 导航（4 个 Tab），桌面端采用顶部导航栏 + 左侧功能区。8 个功能入口（开始刷题、模拟考试、巅峰挑战、重新刷题、题目搜索、更新题目、创建题库、分享题库）以**首页功能入口网格**形式放在题库首页主区域，不放入全局导航。

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| Word/PDF 文档内容解析 | real-plugin | 调用 doc-parser-word-pdf 插件实例，传入用户上传的 Word/PDF 文件，输出文档纯文本内容 | 失败提示（toast "文档解析失败，请检查文件格式） |
| 题目智能识别与结构化提取 | real-plugin | 调用 question-extractor 插件实例，传入解析后的文档文本，输出结构化题目列表（题型、题干、选项、答案、解析、章节） | 失败提示（toast "题目识别暂不可用"） |
| 题库数据 | local-persist | localStorage key=`__app_qbank_banks`，存储所有题库元信息与题目数据 | 初始 1 个 source='mock' 示例题库 |
| 答题记录与进度 | local-persist | localStorage key=`__app_qbank_progress`，存储每道题的作答状态、对错记录 | 无 |
| 收藏题目 | local-persist | localStorage key=`__app_qbank_favorites` | 无 |
| 笔记内容 | local-persist | localStorage key=`__app_qbank_notes` | 无 |
| 刷题设置偏好 | local-persist | localStorage key=`__app_qbank_settings`，保存用户上次选择的刷题配置 | 默认配置 |
| 主题偏好 | local-persist | localStorage key=`__app_qbank_theme`，存储深色/浅色模式偏好 | 浅色主题 |
| 题库分享 | import-export | 生成分享链接/导出 JSON 数据，通过 `navigator.clipboard` 复制分享码 | 无 |
| 初始示例题库 | demo-mock | src/data/mockBank.ts 内置 1 个示例题库（20 道题，覆盖单选/多选/判断/填空/问答），source='mock' | ✅ 本身就是 mock |

> 插件能力不可 mock，识别失败时给出 toast 提示，不提供假数据兜底。

---

## 功能列表

### 页面: 题库首页 (HomePage)
  - **页面目标**: 展示所有题库，提供 8 大功能入口，是应用的主控制台
  - **功能点**:
    - **题库列表展示**: 以卡片形式展示所有已创建题库，显示题库名称、题目数量、最近练习时间、正确率进度条
    - **8 功能入口网格**: 2×4 网格布局，包含开始刷题、模拟考试、巅峰挑战、重新刷题、题目搜索、更新题目、创建题库、分享题库，点击对应功能触发对应操作（开始刷题/模拟考试/巅峰挑战→打开刷题设置弹窗；重新刷题→确认重置；题目搜索→跳搜索页；更新题目→跳导入页追加；创建题库→跳导入页；分享题库→生成分享链接）
    - **创建题库入口**: 点击"创建题库"跳转至题目识别页，引导用户上传文档创建新题库
    - **题库卡片操作**: 点击题库卡片进入题库详情页，长按/右键展示操作菜单（重命名、删除、分享）

### 页面: 题目识别 (ImportPage)
  - **页面目标**: 上传 Word/PDF 文档，智能识别题目并导入题库
  - **功能点**:
    - **文件上传**: 支持拖拽上传和点击选择，支持 .doc/.docx/.pdf 格式，显示上传进度与文件信息
    - **文档解析与题目识别**: 调用插件链式解析文档并识别题目，显示识别进度（解析中→识别中→完成）
    - **识别结果预览与编辑**: 列表展示识别出的所有题目，支持逐题编辑（修改题型、题干、选项、答案、解析、所属章节），支持删除错误识别项、手动新增题目
    - **章节自动识别**: 自动识别文档中的章节标题（如"第一部分：XXX"），并将题目归类到对应章节下，支持手动调整章节归属
    - **确认导入**: 确认后将题目保存为新题库或追加到已有题库，导入成功后跳转至题库详情页
    - **格式说明提示**: 上传区展示支持的题目格式示例，引导用户准备规范文档

### 页面: 题库详情 (QuestionBankDetailPage)
  - **页面目标**: 查看单个题库的题目列表，支持章节浏览、搜索、管理
  - **功能点**:
    - **章节/分类导航**: 左侧章节树，点击章节筛选对应题目，显示每章题目数量
    - **题目列表**: 展示题目题干预览、题型标签、作答状态（未做/正确/错误），支持点击进入单题详情编辑
    - **题目搜索**: 题库内搜索题目关键词
    - **题目管理**: 支持单题编辑、删除，支持批量移动章节
    - **刷题入口**: 页面顶部放置"开始刷题"按钮，点击弹出刷题设置弹窗

### 页面: 答题练习 (PracticePage)
  - **页面目标**: 提供刷题/背题/模拟考试等多种答题体验
  - **功能点**:
    - **答题进度展示**: 顶部进度条显示当前题目序号/总题数、剩余时间（模拟考试模式）
    - **题目内容展示**: 题干、题型标签、章节信息，支持放大字号、上下滑动
    - **选项交互**: 单选/多选/判断/填空/问答五种题型的答题交互（单选点击选项、多选可多选、判断对/错、填空输入框、问答文本域），选项支持点击反馈动效
    - **答案解析展示**: 作答后（刷题模式）或直接展示（背题模式）正确答案与解析，支持展开/收起
    - **收藏与笔记**: 点击收藏按钮收藏题目，点击笔记按钮打开笔记编辑弹窗，保存个人笔记
    - **题目导航**: 上一题/下一题按钮，支持左右滑动切换，支持答题卡弹窗快速跳转
    - **刷题设置弹窗**: 包含刷题范围（全库/收藏/笔记/做错/未做）、筛选题型（全部/单选/多选/判断/填空/问答）、隐藏题目（全选多选题/正确判断题）、刷题模式（刷题/背题）、其他设置（题目乱序、选项乱序、一键全选、答案比对、自动切题、做错自动收藏），底部"开始刷题"按钮

### 页面: 题目搜索 (SearchPage)
  - **页面目标**: 跨题库搜索题目
  - **功能点**:
    - **关键词搜索**: 输入关键词实时搜索所有题库中的题目，支持按题库筛选
    - **搜索结果列表**: 展示匹配题目，高亮关键词，显示所属题库、题型
    - **结果筛选**: 按题型、题库、难度筛选搜索结果

### 页面: 我的收藏/笔记 (FavoritesPage)
  - **页面目标**: 管理收藏题目和笔记
  - **功能点**:
    - **Tab 切换**: 收藏题目 / 我的笔记 两个 Tab
    - **收藏列表**: 展示所有收藏题目，支持取消收藏、点击进入答题
    - **笔记列表**: 展示所有带笔记的题目，显示笔记摘要，支持编辑笔记
    - **筛选**: 按题库、题型筛选收藏/笔记

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_qbank_currentBankId` | 当前选中的题库 ID，类型 `string` | 题库详情页、答题练习页 |
| `__global_qbank_practiceSettings` | 当前刷题会话的设置，类型 `IPracticeSettings` | 题库首页、题库详情页、答题练习页 |
| `__global_qbank_practiceQuestions` | 当前刷题会话的题目列表，类型 `IQuestion[]` | 答题练习页 |

```ts
interface IQuestion {
  id: string;
  bankId: string;
  type: 'single' | 'multiple' | 'judge' | 'fill' | 'essay';
  chapter: string;
  stem: string;
  options?: { key: string; content: string }[];
  answer: string | string[];
  analysis?: string;
  source: 'mock' | 'imported';
  createdAt: number;
}

interface IQuestionBank {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  chapters: string[];
  createdAt: number;
  lastPracticeAt?: number;
  correctRate?: number;
}

interface IPracticeSettings {
  scope: 'all' | 'favorite' | 'note' | 'wrong' | 'unattempted';
  questionTypes: ('single' | 'multiple' | 'judge' | 'fill' | 'essay')[];
  hideAllCorrectMultiple: boolean;
  hideCorrectJudge: boolean;
  mode: 'practice' | 'review' | 'exam' | 'challenge';
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  autoNext: boolean;
  autoCollectWrong: boolean;
  showAnswerCompare: boolean;
}

interface IAnswerRecord {
  questionId: string;
  bankId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  answeredAt: number;
}

interface INote {
  questionId: string;
  bankId: string;
  content: string;
  updatedAt: number;
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Structural Reference —— 参考图提供功能入口网格结构与刷题设置弹窗的信息层级与分组逻辑；视觉风格按玻璃拟态方向重建，不复刻原截图的白底扁平样式。
- **核心情绪 / 应用类型**: 智能题库识别与刷题工具 —— 学习场景下的高效、专注、轻盈、有仪式感。
- **独特记忆点**: 磨砂玻璃卡片悬浮在柔和渐变光晕背景上，答题进度以光晕扩散的方式随答题状态变化。

## 2. Art Direction

- **方向名**: 玻璃拟态学习空间
- **Design Style**: Glassmorphism + Soft Minimalist —— 用半透明磨砂玻璃承载功能，背景用柔和渐变光晕营造专注而不刺眼的学习氛围，符合用户明确要求的玻璃拟态与高级感。
- **DNA 参数**: 圆角 `rounded-2xl / 阴影 多层柔光模糊叠加 / 间距 standard~spacious / 字体方向 现代无衬线、中文字重克制 / 装饰手法 背景渐变色块+内发光边框
- **应用类型**: Tool —— 以卡片式任务流为主，答题页为沉浸式全屏沉浸

## 3. Color System

**色彩关系**: 靛蓝主色 + 同色系浅紫蓝反馈底 + 极浅冷白背景；深色模式下为深空蓝底 + 冰蓝玻璃面。
**配色设计理由**: primary 承担主行动（开始刷题、进度条、激活态；bg 提供柔和渐变背景让玻璃卡片产生层次；accent 用极浅蓝承接 hover 与选中浅底；border 用半透明白边模拟玻璃边缘。
**主色推导**: 从参考图的亮蓝 (#1885f7) 向靛蓝偏移，提升饱和度与通透感，更契合玻璃拟态的光感。
**使用比例**: 60% 中性 / 30% 辅助 / 10% primary；主按钮与进度条用 primary，tab 激活用文字 primary + accent 底，icon 用 accentForeground。

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(210 40% 98%) | 页面基底，叠加渐变光晕 |
| card | `--card` | `bg-card` | hsl(0 0% 100% / 0.7) | 玻璃卡片，backdrop-blur-xl |
| text | `--foreground` | `text-foreground` | hsl(222 47% 11%) | 标题与正文 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 16% 47%) | 辅助说明、元信息 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(221 83% 53%) | 主按钮、进度、激活态 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary 上的文字 |
| accent | `--accent` | `bg-accent` | hsl(210 100% 96%) | hover 浅底、选中浅底 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(221 83% 53%) | accent 上的文字与图标 |
| border | `--border` | `border-border` | hsl(214 32% 91% / 0.8) | 玻璃边框，内发光感 |

**语义色提示**: 成功 hsl(142 71% 45%)，三态：bg hsl(142 76% 96%) / border hsl(142 68% 88%) / text hsl(142 71% 36%)；错误 hsl(0 84% 60%)，三态：bg hsl(0 93% 96%) / border hsl(0 88% 90%) / text hsl(0 75% 42%)；警告 hsl(38 92% 50%)，三态：bg hsl(48 96% 95%) / border hsl(44 92% 86%) / text hsl(32 95% 40%)；语义色饱和度与 primary 对齐 ±10%。

## 4. 字体与节奏

- **font-display**: Noto Sans SC —— 现代清晰、中文字形端正，适合学习工具的稳重感
- **font-body**: Noto Sans SC —— 长时间阅读不疲劳，笔画均匀
- **字号**: H1 text-3xl ~ text-4xl；H2 text-xl ~ text-2xl；body text-base；muted text-sm。
- **圆角**: 大 —— 玻璃卡片用 rounded-2xl，按钮用 rounded-xl，营造柔和亲近感

## 5. 全局布局契约

- **Reference Layout Use**: 功能入口 2×4 网格、刷题设置弹窗的分组结构与选项分组顺序来自参考图；视觉样式与动效按玻璃拟态方向重建。
- **Page / Section Order**: 题库列表 → 题库详情（功能入口网格）→ 刷题设置弹窗 → 答题界面 → 结果页；另含上传识别页、题目编辑页。
- **Standard Content Zone**: Tool max-w-4xl + `mx-auto`；答题页全屏沉浸，内容区 max-w-3xl。
- **Shell / Frame Alignment**: 顶部导航 + 内容区同宽对齐，移动端底部安全区独立。
- **Padding & Rhythm**: `px-4 md:px-6 py-8 md:py-12`，垂直节奏 8px 倍数。
- **Full-bleed Zones**: 答题页、上传页 Hero 背景渐变全宽，内部内容受 Standard Content Zone 约束。
- **Local Narrowing**: 设置弹窗、表单、设置正文 `max-w-2xl mx-auto`。
- **Overflow Strategy**: 题型选项横向滚动、题目列表纵向滚动，使用 `overflow-x-auto`。
- **Flexibility Boundary**: 允许移动端卡片内边距与网格列数微调；不允许切换主色、圆角、玻璃质感与阴影语言。

## 6. 视觉与动效

- **装饰**: 背景柔和渐变色斑（靛蓝→紫→青的低饱和光晕，模糊 80px+
- **阴影/边界**: 中 —— 玻璃卡片用 `shadow-lg` + 内发光 1px 半透明白边 + backdrop-blur-xl
- **动效**: 精致 —— hover 卡片轻微上浮 + 光晕增强；答题切换 slide + fade；设置弹窗从底部滑入

## 7. 组件原则

- 按钮、选项卡、菜单、玻璃卡片必须有 Default / Hover / Active / Focus / Disabled 状态。
- Primary 承担主行动；选项选中态用 accent 底 + primary 文字；玻璃卡片 hover 时背景透明度提升 + 阴影增强。
- 加载、空状态、错误页延续玻璃与光晕语言，不用默认 shadcn 灰底。

## 8. Image Direction

- **Image Role**: 背景氛围图
- **Image Art Direction**: 极柔的抽象渐变光斑画面，靛蓝、淡紫、冰青三色低饱和交融，高斯模糊处理，作为玻璃卡片背后的光感基底；无具体物体，只有光与色的呼吸感，营造专注而不刺眼的学习空间。
- **Image Prompt Keywords**: abstract soft gradient, indigo to lavender to ice cyan, ambient glow, heavily blurred, no objects, ethereal light, minimal atmosphere, soft bokeh, calm study mood, frosted glass backdrop
- **Image Avoidance**: 避免具象人物、办公场景、商务素材图库感、高饱和霓虹、科技线路图案、明显几何图形堆砌

## 9. Anti-patterns

- **Flat glass mismatch**: 做成普通白底卡片加阴影，失去毛玻璃通透与背景光晕层次；必须有 backdrop-blur + 半透明白边 + 背景光斑三层叠加。
- **Blue overload**: 主按钮、tab、icon、边框、链接全用 primary；按 60-30-10 分配，primary 只留给 CTA 与进度锚点。
- **Heavy shadows**: 用深黑硬阴影模拟玻璃；玻璃阴影是柔光扩散 + 内发光边。
- **Invisible interaction**: 只做 hover 不做 focus-visible；所有可交互元素必须有清晰键盘焦点环。
- **Mobile cram**: 桌面端照搬 8 宫格不变；移动端可调整为 4×2 或 3×3，保持玻璃质感一致。
- **Status color clash**: 成功/错误色饱和度远高于主色，视觉跳脱；语义色饱和度与 primary 对齐 ±10%。
// EXPORTS: parseQuestionsFromText, IQuestionRaw, normalizeQuestion

export interface IQuestionRaw {
  type: 'single' | 'multiple' | 'judge' | 'fill' | 'essay';
  stem: string;
  options: { key: string; content: string }[];
  answer: string | string[];
  analysis: string;
  chapter: string;
}

const CHAPTER_PATTERNS = [
  /^第[一二三四五六七八九十百千\d]+[部分章节讲]\s*[：:]?\s*(.*)$/,
  /^Chapter\s*\d+[：:\.\s-]*(.*)$/i,
  /^[一二三四五六七八九十]+、\s*(.*)$/,
  /^\d+\.\d+\s+(.*)$/,
];

const OPTION_PATTERN = /^([A-ZＡ-Ｚ])[\.．、\)）]\s*(.+)$/;

const ANSWER_IN_BRACKET = /[（(]\s*([A-ZＡ-Ｚ\s,，、]+)\s*[)）]/;

const JUDGE_ANSWER_PATTERN = /[（(]\s*(对|错|正确|错误|√|×|T|F|True|False)\s*[)）]/i;

const FILL_BLANK_PATTERN = /_{3,}|（\s*）|\(\s*\)|\[?\s*]|____/;

function detectChapter(line: string): string | null {
  for (const re of CHAPTER_PATTERNS) {
    const m = line.match(re);
    if (m) {
      const title = (m[1] || line).trim();
      return title || line.trim();
    }
  }
  return null;
}

function isOptionLine(line: string): { key: string; content: string } | null {
  const m = line.match(OPTION_PATTERN);
  if (!m) return null;
  const key = m[1].toUpperCase().replace(/[Ａ-Ｚ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xff21 + 0x41)
  );
  return { key, content: m[2].trim() };
}

function normalizeAnswer(raw: string): string | string[] {
  const cleaned = raw
    .trim()
    .replace(/[，,、\s]/g, '')
    .replace(/[Ａ-Ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xff21 + 0x41))
    .toUpperCase();
  if (cleaned.length > 1 && /^[A-Z]+$/.test(cleaned)) {
    return cleaned.split('');
  }
  return cleaned || raw.trim();
}

function normalizeJudgeAnswer(raw: string): string {
  const t = raw.trim();
  if (/^(对|正确|√|T|True)$/i.test(t)) return '正确';
  if (/^(错|错误|×|F|False)$/i.test(t)) return '错误';
  return t;
}

function guessType(stem: string, options: { key: string; content: string }[], answer: string | string[]): IQuestionRaw['type'] {
  if (options.length >= 2) {
    if (Array.isArray(answer) && answer.length > 1) return 'multiple';
    if (typeof answer === 'string' && answer.length > 1 && /^[A-Z]{2,}$/.test(answer)) return 'multiple';
    return 'single';
  }
  if (FILL_BLANK_PATTERN.test(stem)) return 'fill';
  if (
    /^(对|错|正确|错误|是否|是不是|有没有)$/.test(typeof answer === 'string' ? answer : '') ||
    /[（(]\s*(对|错|正确|错误|√|×|T|F)\s*[)）]/.test(stem) ||
    stem.endsWith('（ ）') ||
    stem.endsWith('()')
  ) {
    // 判断题特征：题干是陈述 + 答案是对/错
    if (typeof answer === 'string' && /^(正确|错误|对|错)$/.test(answer)) return 'judge';
  }
  // 没有选项且不是填空/判断 → 问答题
  if (options.length === 0 && !FILL_BLANK_PATTERN.test(stem)) {
    // 如果答案较短且像填空答案
    if (typeof answer === 'string' && answer.length > 0 && answer.length < 30 && !/[。！？\n]/.test(answer)) {
      return 'fill';
    }
    return 'essay';
  }
  return 'single';
}

export function parseQuestionsFromText(text: string): IQuestionRaw[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  const questions: IQuestionRaw[] = [];
  let currentChapter = '';
  let currentStemLines: string[] = [];
  let currentOptions: { key: string; content: string }[] = [];
  let currentAnswer: string = '';
  let currentAnalysis: string = '';
  let inAnalysis = false;

  const flush = () => {
    if (currentStemLines.length === 0) return;
    let stem = currentStemLines.join(' ').trim();

    // 从题干末尾提取括号答案
    const bracketMatch = stem.match(ANSWER_IN_BRACKET);
    if (bracketMatch && !currentAnswer) {
      currentAnswer = bracketMatch[1];
      stem = stem.replace(ANSWER_IN_BRACKET, '（ ）').trim();
    }

    // 判断题答案
    const judgeMatch = stem.match(JUDGE_ANSWER_PATTERN);
    if (judgeMatch && !currentAnswer) {
      currentAnswer = normalizeJudgeAnswer(judgeMatch[1]);
      stem = stem.replace(JUDGE_ANSWER_PATTERN, '（ ）').trim();
    }

    const answer = currentAnswer ? normalizeAnswer(currentAnswer) : '';
    const type = guessType(stem, currentOptions, answer);

    questions.push({
      type,
      stem,
      options: currentOptions,
      answer: type === 'judge' && typeof answer === 'string' ? normalizeJudgeAnswer(answer) : answer,
      analysis: currentAnalysis.trim(),
      chapter: currentChapter,
    });

    currentStemLines = [];
    currentOptions = [];
    currentAnswer = '';
    currentAnalysis = '';
    inAnalysis = false;
  };

  for (const line of lines) {
    // 章节检测
    const chapter = detectChapter(line);
    if (chapter && !isOptionLine(line) && line.length < 60) {
      flush();
      currentChapter = chapter;
      continue;
    }

    // 解析/答案行检测
    if (/^(答案[：:]|【答案】|参考答案[：:]?)/.test(line)) {
      currentAnswer = line.replace(/^(答案[：:]|【答案】|参考答案[：:]?)\s*/, '').trim();
      inAnalysis = false;
      continue;
    }
    if (/^(解析[：:]|【解析】|答案解析[：:]?)/.test(line)) {
      currentAnalysis = line.replace(/^(解析[：:]|【解析】|答案解析[：:]?)\s*/, '').trim();
      inAnalysis = true;
      continue;
    }

    // 选项行检测
    const opt = isOptionLine(line);
    if (opt) {
      inAnalysis = false;
      // 如果当前已经有题干且遇到新的选项，继续收集
      if (currentStemLines.length > 0 || currentOptions.length > 0) {
        currentOptions.push(opt);
        continue;
      }
    }

    // 如果在解析区
    if (inAnalysis) {
      currentAnalysis += (currentAnalysis ? ' ' : '') + line;
      continue;
    }

    // 新题目检测：以数字开头 + 点/顿号
    const questionStart = /^(\d+)[\.．、\)）]\s*(.+)$/.exec(line);
    if (questionStart && !opt) {
      flush();
      currentStemLines = [questionStart[2]];
      continue;
    }

    // 否则追加到当前题干
    if (currentStemLines.length > 0) {
      currentStemLines.push(line);
    }
  }

  flush();
  return questions;
}

export function normalizeQuestion(q: IQuestionRaw, index: number, bankId: string) {
  return {
    id: `imported-${Date.now()}-${index}`,
    bankId,
    type: q.type,
    chapter: q.chapter || '未分类',
    stem: q.stem,
    options: q.options,
    answer: q.answer,
    analysis: q.analysis,
    source: 'imported' as const,
    createdAt: Date.now(),
  };
}

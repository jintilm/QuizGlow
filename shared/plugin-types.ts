// ---- plugin:doc_parser_for_question_recognition_1 ----
// ============================================================
// 插件 doc_parser_for_question_recognition_1 (Word/PDF文档解析用于题目识别) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface DocParserForQuestionRecognitionOneInput {
  /** 用户上传的Word/PDF文档文件 */
  document_file: string[];
}

/**
 * capabilityClient.load('doc_parser_for_question_recognition_1').call<DocParserForQuestionRecognitionOneOutput>('parseDocToMarkdown', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content } = result;
 */
export interface DocParserForQuestionRecognitionOneOutput {
  /** [object Object] */
  content: string;
}
// ---- end:doc_parser_for_question_recognition_1 ----

// ---- plugin:question_intelligent_recognition_1 ----
// ============================================================
// 插件 question_intelligent_recognition_1 (题目智能识别) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface QuestionIntelligentRecognitionOneInput {
  /** 包含题目的文档文本内容 */
  document_text: string;
}

/**
 * capabilityClient.load('question_intelligent_recognition_1').call<QuestionIntelligentRecognitionOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { question_list } = result;
 */
export interface QuestionIntelligentRecognitionOneOutput {
  /** 题目列表，items schema: {type: string(题型，可选值：single/multiple/judge/fill/essay), stem: string(题干), options: array<string>(选项数组，仅单选多选填写), answer: string(答案), analysis: string(解析), chapter: string(所属章节)} */
  question_list: unknown[];
}
// ---- end:question_intelligent_recognition_1 ----
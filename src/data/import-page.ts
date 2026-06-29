// EXPORTS: IImportPage, MOCK_IMPORT_PAGES
export interface IImportPage {
  id: string
  uploadTitle: string
  uploadSubtitle: string
  supportedFormats: string[]
  formatTips: string[]
  uploadAreaImageUrl: string
  resultAreaImageUrl: string
  parseSteps: string[]
  sampleQuestionCount: number
}

export const MOCK_IMPORT_PAGES: IImportPage[] = [
  {
    id: '1',
    uploadTitle: '上传文档，智能识别题目',
    uploadSubtitle: '支持 Word / PDF 格式，自动提取题型、题干、选项与答案',
    supportedFormats: ['.doc', '.docx', '.pdf'],
    formatTips: [
      '题目后括号内标注正确答案',
      '选项以 A/B/C/D 字母开头',
      '支持章节标题自动分类',
    ],
    uploadAreaImageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkieg37xcfg_ve_miaoda',
    resultAreaImageUrl: '/spark/app/app_1792w7mqmx5/runtime/api/v1/storage/object/bucket_aadkie3zgqaco_static/static%2Faadkidgqgraiq_ve_miaoda',
    parseSteps: ['文档解析中', '题目识别中', '识别完成'],
    sampleQuestionCount: 20,
  },
]
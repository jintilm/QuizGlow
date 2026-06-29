import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import BottomTabBar from '@/components/BottomTabBar';
import { BankStoreProvider } from '@/store/bank-store';
import { MOCK_QUESTIONS, MOCK_BANK_INFO } from '@/data/mockbank';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { useEffect } from 'react';

export const Layout = () => {
  const isMobile = useIsMobile();
  const { isDark } = useTheme();

  // 初始化 mock 题库数据
  const initialBanks = [
    {
      id: MOCK_BANK_INFO.id,
      name: MOCK_BANK_INFO.name,
      description: MOCK_BANK_INFO.description,
      questionCount: MOCK_BANK_INFO.questionCount,
      chapters: MOCK_BANK_INFO.chapters,
      createdAt: MOCK_BANK_INFO.createdAt,
      lastPracticeAt: MOCK_BANK_INFO.lastPracticeAt,
      correctRate: MOCK_BANK_INFO.correctRate,
      source: MOCK_BANK_INFO.source,
      questions: MOCK_QUESTIONS,
    },
  ];

  return (
    <BankStoreProvider initialBanks={initialBanks as any}>
      <div className="min-h-screen bg-gradient-to-br from-[rgba(228_229_230_0.6)] via-[rgba(250_237_182_0.6)] to-[rgba(243_232_203_0.6)]">
        {/* 背景装饰光晕 */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/40 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-chart-3/10 blur-[90px]" />
        </div>

        <Header />

        <main className={`w-full ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>

        {isMobile && <BottomTabBar />}
      </div>
    </BankStoreProvider>
  );
};

import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage/HomePage";
import ImportPage from "@/pages/ImportPage/ImportPage";
import QuestionBankDetailPage from "@/pages/QuestionBankDetailPage/QuestionBankDetailPage";
import PracticePage from "@/pages/PracticePage/PracticePage";
import SearchPage from "@/pages/SearchPage/SearchPage";
import FavoritesPage from "@/pages/FavoritesPage/FavoritesPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="bank/:id" element={<QuestionBankDetailPage />} />
        <Route path="practice/:id" element={<PracticePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

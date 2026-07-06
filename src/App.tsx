import '@/lib/sentry';
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorBusProvider } from '@/components/ErrorBus';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import MitarbeiterverzeichnisPage from '@/pages/MitarbeiterverzeichnisPage';
import MitarbeiterverzeichnisDetailPage from '@/pages/MitarbeiterverzeichnisDetailPage';
import PublicFormMitarbeiterverzeichnis from '@/pages/public/PublicForm_Mitarbeiterverzeichnis';
// <public:imports>
// </public:imports>
// <custom:imports>
// </custom:imports>

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorBusProvider>
        <HashRouter>
          <ActionsProvider>
            <Routes>
              <Route path="public/6a4782736e67a998c8af44c7" element={<PublicFormMitarbeiterverzeichnis />} />
              {/* <public:routes> */}
              {/* </public:routes> */}
              <Route element={<Layout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="mitarbeiterverzeichnis" element={<MitarbeiterverzeichnisPage />} />
                <Route path="mitarbeiterverzeichnis/:id" element={<MitarbeiterverzeichnisDetailPage />} />
                <Route path="admin" element={<AdminPage />} />
                {/* <custom:routes> */}
                {/* </custom:routes> */}
              </Route>
            </Routes>
          </ActionsProvider>
        </HashRouter>
      </ErrorBusProvider>
    </ErrorBoundary>
  );
}

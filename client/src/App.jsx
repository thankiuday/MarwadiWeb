import AppRouter from './routes/AppRouter';
import NotificationToast from './components/notifications/NotificationToast';
import ManifestSwitcher from './components/layout/ManifestSwitcher';

function App() {
  return (
    <>
      <ManifestSwitcher />
      <NotificationToast />
      <AppRouter />
    </>
  );
}

export default App;

import AppRouter from './routes/AppRouter';
import NotificationToast from './components/notifications/NotificationToast';

function App() {
  return (
    <>
      <NotificationToast />
      <AppRouter />
    </>
  );
}

export default App;

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import PatientPortal from './pages/PatientPortal';
const queryClient = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PatientPortal />
    </QueryClientProvider>
  );
}
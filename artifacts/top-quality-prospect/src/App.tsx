import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppLayout } from './components/layout/AppLayout';

import Home from './pages/Home';
import About from './pages/About';
import NDT from './pages/NDT';
import Training from './pages/Training';
import Services from './pages/Services';
import Certificates from './pages/Certificates';
import Contact from './pages/Contact';
import DynamicPage from './pages/DynamicPage';

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/ndt" component={NDT} />
        <Route path="/training" component={Training} />
        <Route path="/services" component={Services} />
        <Route path="/certificates" component={Certificates} />
        <Route path="/contact" component={Contact} />
        <Route path="/p/:slug" component={DynamicPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

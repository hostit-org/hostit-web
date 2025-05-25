import { AppLayoutClient } from './app-layout-client';

interface AppLayoutProps {
  children: React.ReactNode;
}
 
export async function AppLayout({ children }: AppLayoutProps) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
} 
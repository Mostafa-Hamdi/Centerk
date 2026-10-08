import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

/** "/" → dashboard (middleware sends signed-out visitors to /login first). */
export default function HomePage() {
  redirect(routes.dashboard);
}

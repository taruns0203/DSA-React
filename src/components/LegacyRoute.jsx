import { useLocation } from 'react-router-dom';
import LegacyPage from '../pages/LegacyPage.jsx';

export default function LegacyRoute() {
  const { pathname } = useLocation();
  return <LegacyPage sourcePath={pathname} />;
}

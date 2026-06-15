import ShellPage from '@/components/ShellPage';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';

export default function TimesheetsPage() {
  return (
    <ShellPage
      title="Timesheets"
      description="View and manage employee timesheets"
      heroImage={BRAND_HERO_IMAGES.timesheets}
    />
  );
}

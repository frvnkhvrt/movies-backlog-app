import SiteFooter from '@/components/main/site-footer';
import SiteHeader from '@/components/main/site-header';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="transition-all duration-300 ease-smooth filter-none">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default FrontLayout;

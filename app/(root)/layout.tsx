import Header from '@/components/shared/header';
import '../globals.css'
import Footer from '@/components/footer';

// The storefront reads the database (products, categories, reviews) on every request, so it
// must not be pre-rendered at build time, when the database connection isn't available
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <div className="flex h-screen flex-col">
        <Header/>
        <main className="flex-1 wrapper">{children}</main>
        <Footer/>
      </div>
  );
}

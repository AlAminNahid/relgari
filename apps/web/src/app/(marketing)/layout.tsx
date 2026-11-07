import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div
        className="h-1.5 bg-[linear-gradient(90deg,var(--primary)_0_78%,var(--brand-red)_78%_100%)]"
        aria-hidden="true"
      />
      <Navbar />
      <main id="top">{children}</main>
      <Footer />
    </>
  );
}

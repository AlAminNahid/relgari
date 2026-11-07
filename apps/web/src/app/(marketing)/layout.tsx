import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentUser } from "@/services/auth.server";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <>
      <div
        className="h-1.5 bg-[linear-gradient(90deg,var(--primary)_0_78%,var(--brand-red)_78%_100%)]"
        aria-hidden="true"
      />
      <Navbar user={user} />
      <main id="top">{children}</main>
      <Footer />
    </>
  );
}

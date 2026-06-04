import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { getSellerById } from "@/data/sellers";
import { DASHBOARD_SELLER_ID } from "@/data/seller-dashboard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const seller = getSellerById(DASHBOARD_SELLER_ID);
  const sellerName = seller?.name ?? "Sprzedawca";

  return (
    <div className="flex min-h-screen bg-cream">
      <SellerSidebar sellerName={sellerName} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

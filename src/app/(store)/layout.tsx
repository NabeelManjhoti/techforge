import { CartProvider } from "@/components/cart-provider";
import NavBar from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}

import { NavBarShell } from "@/components/nav-bar-shell";
import { getCategories } from "@/lib/products";

export default async function NavBar() {
  const categories = await getCategories();
  return <NavBarShell categories={categories} />;
}

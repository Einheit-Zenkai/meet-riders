import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export default function Navbar() {
  return (
    <NavigationMenu className="bg-black text-white px-6 py-3 shadow-md w-full justify-end">
      <NavigationMenuList className="flex space-x-6">
        <NavigationMenuItem>
          <Link href="/profile" passHref legacyBehavior>
            <NavigationMenuLink className="hover:text-orange-500 transition-colors">
              Profile
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/my-parties" passHref legacyBehavior>
            <NavigationMenuLink className="hover:text-orange-500 transition-colors">
              My Parties
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/settings" passHref legacyBehavior>
            <NavigationMenuLink className="hover:text-orange-500 transition-colors">
              Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

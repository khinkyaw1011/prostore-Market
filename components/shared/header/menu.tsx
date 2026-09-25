import ModeToggle from "./mode-toggle";
import { Button } from "@base-ui/react";
import { ShoppingCart, UserIcon } from "lucide-react";
import Link from "next/link";
import { FiMoreVertical } from "react-icons/fi";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";

const MenuPage = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-4 align-middle">
        <div>
          <ModeToggle />
        </div>
        <Button>
          <Link href="/sign-in" className="flex items-center gap-2">
            <ShoppingCart />
            Cart
          </Link>
        </Button>
        <Button className="rounded bg-black text-white px-3 py-2">
          <Link href="/sign-in" className="flex items-center gap-2">
            <UserIcon />
            Sign In
          </Link>
        </Button>
      </nav>

      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className='align-middle'>
            <FiMoreVertical />
          </SheetTrigger>
         <SheetContent className="p-5 flex flex-col items-start gap-4">
            <SheetTitle className='text-xl'>Menu</SheetTitle>
            <ModeToggle />
            <Button>
              <Link href="/cart" className="flex items-center gap-2">
                <ShoppingCart /> Cart
              </Link>
            </Button>
            
            <SheetDescription></SheetDescription>
            <SheetFooter className="w-full">
         
          <Button className="bg-black text-white rounded-2xl p-2 w-full">
              <Link href="/sign-in" className="flex items-center justify-center gap-2">
                <UserIcon /> Sign In
              </Link>
            </Button>
        </SheetFooter>
          </SheetContent>
         
        </Sheet>
      </nav>
    </div>
  );
};

export default MenuPage;

import ModeToggle from "./mode-toggle";
import { Button } from "@base-ui/react";
import { ShoppingCart, UserIcon } from "lucide-react";
import Link from "next/link";
import { FiMoreVertical } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import UserButton from "./user-button";

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
        <UserButton/>
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
            <UserButton/>
          </SheetFooter>
          </SheetContent>
         
        </Sheet>
      </nav>
    </div>
  );
};

export default MenuPage;

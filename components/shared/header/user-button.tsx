import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/actions/user.action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

const UserButton = async () => {
  const session = await auth();

  // If not logged in, show Sign In button
  if (!session) {
    return (
      <Button
        className="rounded p-4 m-2"
        nativeButton={false}
        render={<Link href="/sign-in" className="flex gap-2" />}
      >
        <UserIcon /> Sign In
      </Button>
    );
  }

  // Get user's first initial
  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? "";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center glass-pill"
            />
          }
        >
          {firstInitial}
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium leading-none">
                {session.user?.name}
              </div>
              <div className="text-sm text-muted-foreground leading-none">
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem className="p-0 mb-1">
            <form action={signOutUser} className="w-full">
              
              <DropdownMenuItem>
                <Link href="/user/profile" className="w-full">
                  User Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Link href="/user/order" className="w-full">
                  Order History
                </Link>
              </DropdownMenuItem>
              {session.user.role === "admin" && (
                <DropdownMenuItem>
                  <Link href="/admin/overview" className="w-full">
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <Button
                className="w-full py-4 px-2 justify-start"
                variant="ghost"
                type="submit"
              >
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;

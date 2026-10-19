"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { Loader, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export default function AddToCart({
  cart,
  item,
}: {
  cart?: { items: CartItem[] };
  item: CartItem;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        const res = await addItemToCart(item);

        // Handle error state
        if (!res.success) {
          toast.add({
            type: "error",
            title: "Error",
            description: res.message,
            priority: "high",
          });
          return;
        }

        // Handle success state
        toast.add({
          type: "success",
          description: res.message,
          actionProps: {
            children: "Go to cart",
            onClick() {
              toast.close();
              router.push("/cart");
            },
          },
        });
      } catch {
        toast.add({
          type: "error",
          title: "Error",
          description: "Something went wrong. Please try again.",
          priority: "high",
        });
      }
    });
  };

  const handleRemoveFromCart = () => {
    startTransition(async () => {
      try {
        const res = await removeItemFromCart(item.productId);

        if (!res.success) {
          toast.add({
            type: "error",
            title: "Error",
            description: res.message,
            priority: "high",
          });
          return;
        }

        toast.add({
          type: "success",
          description: res.message,
        });
      } catch {
        toast.add({
          type: "error",
          title: "Error",
          description: "Something went wrong. Please try again.",
          priority: "high",
        });
      }
    });
  };

  // Check if item is in cart
  const existItem = cart?.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className="flex items-center justify-center">
      <Button
        type="button"
        variant="outline"
        onClick={handleRemoveFromCart}
        disabled={isPending}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddToCart}
        disabled={isPending}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}{" "}
      Add to cart
    </Button>
  );
}
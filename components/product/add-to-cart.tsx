"use client";

import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export default function AddToCart({ item }: { item: CartItem }) {
  const router = useRouter();

  const handleAddToCart = async () => {
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
        description:res.message,
        actionProps: {
          children: "Go to cart",
           onClick() {
            toast.close();
            router.push('/cart');
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
  };

  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <Plus /> Add to cart
    </Button>
  );
}

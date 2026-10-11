"use server";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { db } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
    ),
    shippingPrice = round2(itemPrice > 100 ? 0 : 100),
    taxPrice = round2(0.15 * itemPrice),
    totalPrice = round2(itemPrice + taxPrice + shippingPrice);

  return {
    itemPrice: itemPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

type CartCreate = Parameters<typeof db.orm.public.Cart.create>[0];
type CartPrices = Pick<
  CartCreate,
  "itemPrice" | "totalPrice" | "shippingPrice" | "taxPrice"
>;

// calcPrice returns strings; the contract expects Numeric<12, 2>
const prices = (items: CartItem[]) => calcPrice(items) as unknown as CartPrices;

export async function addItemToCart(data: CartItem) {
  try {
    const cookieStore = await cookies();
    let sessionCartId = cookieStore.get("sessionCartId")?.value;

    if (!sessionCartId) {
      sessionCartId = crypto.randomUUID();
      cookieStore.set("sessionCartId", sessionCartId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await db.orm.public.Cart.where({ sessionCartId }).first();

    const item = cartItemSchema.parse(data);

    const product = await db.orm.public.Product.where({
      id: item.productId,
    }).first();
    if (!product) throw new Error("Product not found");

    if (!cart) {
      if (product.stock < 1) throw new Error("Not enough stock");

      // Create new cart object
      const newCart = insertCartSchema.parse({
        userId,
        items: [item],
        sessionCartId,
        ...calcPrice([item]),
      });

      // Add to database
      await db.orm.public.Cart.create({
        ...newCart,
        ...prices([item]),
      } as unknown as CartCreate);

      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    }

    // Cart exists: update quantity or add the new item
    const currentItems = cart.items as unknown as CartItem[];
    const existItem = currentItems.find((x) => x.productId === item.productId);

    if (product.stock < (existItem ? existItem.qty + 1 : 1)) {
      throw new Error("Not enough stock");
    }

    const items: CartItem[] = existItem
      ? currentItems.map((x) =>
          x.productId === item.productId ? { ...x, qty: x.qty + 1 } : x,
        )
      : [...currentItems, item];

    await db.orm.public.Cart.where({ id: cart.id }).update({
      items,
      ...prices(items),
    });

    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: `${product.name} ${existItem ? "updated in" : "added to"} cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  if (!sessionCartId && !userId) return undefined;

  let cart;
  if (userId) {
    cart = await db.orm.public.Cart.where({ userId }).first();
  }
  if (!cart && sessionCartId) {
    cart = await db.orm.public.Cart.where({ sessionCartId }).first();
  }

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as unknown as CartItem[],
    itemPrice: cart.itemPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
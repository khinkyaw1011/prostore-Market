import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./productPrice";
import Rating from "@/components/shared/product/rating";
const ProductCard = ({ product }: { product: any }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="relative p-0 items-center">
        {product.isFeatured && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gold px-3 py-0.5 text-xs font-medium text-gold-foreground">
            Featured
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} width={500} height={300} priority={true} />
          ) : (
            <div className="flex h-75 w-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="text-xs">{product.brand}</div>
        <Link href={`/product/${product.slug}`}>
        <h2 className="text-sm font-medium">{product.name}</h2>
        </Link>
        <div className="flex-between gap-4">
            <Rating value={Number(product.rating)} />
            {product.stock > 0 ? (
                <ProductPrice value={Number(product.price)} />
            ):(
              <p className="text-destructive">Out of Stock</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

import Link from "next/link";
import ProductList from "@/components/product/product";
import { buttonVariants } from "@/components/ui/button";
import { getLatestProducts } from "@/lib/actions/product.action";

const HomePage = async() => {
  const latestProducts=await getLatestProducts();
  return ( <>
     <ProductList data={latestProducts} title="Newest arrivals"/>
     <div className="flex justify-center mb-10">
       <Link href="/products" className={buttonVariants({ variant: "outline", size: "lg", className: "px-8" })}>
         View All Products
       </Link>
     </div>
   </>
   );
}

export default HomePage;

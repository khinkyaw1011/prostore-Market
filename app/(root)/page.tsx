import ProductList from "@/components/product/product";
import ViewAllProductsButton from "@/components/view-all-products-button";
import ProductCarousel from "@/components/product/product-carousel";
import { getFeaturedProducts, getLatestProducts } from "@/lib/actions/product.action";

const HomePage = async() => {
  const latestProducts=await getLatestProducts();
  const featuredProducts=await getFeaturedProducts();
  return ( <>
     {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts} />}
     <ProductList data={latestProducts} title="Newest arrivals"/>
     <ViewAllProductsButton />
   </>
   );
}

export default HomePage;

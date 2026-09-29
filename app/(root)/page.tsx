import ProductList from "@/components/product/product";
import { getLatestProducts } from "@/lib/actions/product.action";

const HomePage = async() => {
  const latestProducts=await getLatestProducts();
  return ( <>
     <ProductList data={latestProducts} title="Newest arrivals"/>
   </> );
}
 
export default HomePage;
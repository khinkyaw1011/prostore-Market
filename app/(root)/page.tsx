import ProductList from "@/components/shared/product/product";
import sampleData from "@/db/sample-data";

const HomePage = () => {
  return ( <>
     <ProductList data={sampleData.products} title="Newest arrivals"/>
   </> );
}
 
export default HomePage;
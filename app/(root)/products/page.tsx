import ProductList from "@/components/product/product";
import Pagination from "@/components/shared/pagination";
import { getAllProducts } from "@/lib/actions/product.action";

export const metadata = {
  title: 'All Products',
};

const ProductsPage = async (props: PageProps<'/products'>) => {
  const { page } = await props.searchParams;
  const products = await getAllProducts({ query: '', page: Number(page) || 1 });
  return ( <>
     <ProductList data={products.data} title="All Products"/>
     {products.totalPages > 1 && (
       <Pagination page={Number(page) || 1} totalPages={products.totalPages} />
     )}
   </>
   );
}

export default ProductsPage;

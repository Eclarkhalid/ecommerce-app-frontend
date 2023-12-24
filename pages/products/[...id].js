import { CartContext } from "@/lib/CartContext";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { useContext } from "react";
import toast from "react-hot-toast";

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function ProductPage({ product }) {
  const { addProduct } = useContext(CartContext);
  if (product) {
    return <>
      <section className="mt-20 md:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:aspect-h-2 lg:aspect-w-2 lg:rounded-lg overflow-hidden px-4 md:px-2">
            <img src={product.images[0]} alt="product-image" className="w-full h-full md:h-[90vh] object-cover object-center border border-primary rounded-lg" />
          </div>

          <div className="grid grid-cols-2 lg:grid lg:grid-cols-1 lg:gap-y-4 px-2 gap-2 md:gap-0 md:px-2">
            {product.images.slice(1, 3).map((image, index) => (
              <div className="lg:aspect-h-2 lg:aspect-w-3 lg:rounded-lg lg:overflow-hidden" key={index}>
                <img src={image} alt="product-image" className="w-full h-full md:h-[44vh] object-cover object-center border border-secondary rounded-lg p-4" />
              </div>
            ))}
          </div>
          <div className="p-4 lg:p-8 border">
            <h1 className="text-3xl font-semibold text-text">
              {product.title}
            </h1>
            <div className="mt-6">
              <h2 className="text-xl font-semibold">
                Description
              </h2>
              <p className="mt-2 text-gray-700">
                {product.description}
              </p>
            </div>

            {/* product deails */}
            {/* <div className="mt-6">
            <h2 className="text-xl font-semibold">
                Details
              </h2>
              <p className="mt-2 text-gray-700">
                {product.details}
              </p>
            </div> */}

            <div className="mt-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Price
              </h2>

              <p className="mt-2 text-primary font-semibold text-lg">
                Ksh. {formatPrice(product.price)}
              </p>
            </div>

            <div class=" text-center w-full mt-6">
              <button onClick={() => { addProduct(product._id); toast.success("Item added to cart") }} className=" block rounded bg-secondary px-5 py-3 text-md text-text transition hover:bg-purple-300 w-full">Add to cart</button>
            </div>
          </div>
        </div>
      </section>
    </>
  }
}

export async function getServerSideProps(context) {
  await mongooseConnect();
  const { id } = context.query;

  const product = await Product.findById(id);

  return {
    props: {
      product: JSON.parse(JSON.stringify(product))
    }
  }
}
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {useLoaderData} from '@remix-run/react';
import {flattenConnection, getPaginationVariables} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';

import {ProductCardGrid} from '~/components/product/ProductCardGrid';
import {ALL_PRODUCTS_QUERY} from '~/graphql/queries';
import {useSanityRoot} from '~/hooks/useSanityRoot';
import {seoPayload} from '~/lib/seo.server';

const PAGE_BY = 32;

export async function loader({
  context: {storefront},
  request,
}: LoaderFunctionArgs) {
  const variables = getPaginationVariables(request, {pageBy: PAGE_BY});

  const data = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.collection({
    collection: {
      description: 'All the store products',
      descriptionHtml: 'All the store products',
      handle: 'products',
      id: 'all-products',
      metafields: [],
      products: data.products,
      seo: {
        description: 'All the store products',
        title: 'All Products',
      },
      title: 'All Products',
      updatedAt: '',
    },
    url: request.url,
  });

  return json({products: data.products, seo});
}

export default function AllProducts() {
  const data = useLoaderData<typeof loader>();
  const themeContent = useSanityRoot().data?.themeContent;
  const products = data.products?.nodes.length
    ? flattenConnection(data.products)
    : [];

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-light text-center text-custom mb-10">Explora la naturaleza</h1>
      {products.length > 0 ? (
        <ProductCardGrid products={products} />
      ) : (
        <p>{themeContent?.collection?.noProductFound}</p>
      )}
    </div>
  );
}

import type {TypeFromSelection} from 'groqd';
import type {ProductVariantFragmentFragment} from 'storefrontapi.generated';
import {Await, useLoaderData} from '@remix-run/react';
import {vercelStegaCleanAll} from '@sanity/client/stega';
import {flattenConnection} from '@shopify/hydrogen-react';
import {Suspense, createContext, useContext} from 'react';
import type {SectionDefaultProps} from '~/lib/type';
import type {PRODUCT_INFORMATION_SECTION_FRAGMENT} from '~/qroq/sections';
import type {loader} from '~/routes/($locale).products.$productHandle';
import type {CollectionsQuery} from 'storefrontapi.generated';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/Accordion";

import {cn, getAspectRatioData} from '~/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import {Skeleton} from '../Skeleton';
import {MediaGallery} from '../product/MediaGallery';
import {ProductDetails} from '../product/ProductDetails';
import type {ShopifyTitleBlockProps} from '../blocks/ShopifyTitleBlock';
import {useProduct} from '@shopify/hydrogen-react';

export type ProductInformationSectionProps = TypeFromSelection<
  typeof PRODUCT_INFORMATION_SECTION_FRAGMENT
>;

type ProductVariantsContextType = {
  variants: ProductVariantFragmentFragment[];
};

export function ProductInformationSection(
  props: SectionDefaultProps & {
    collection?: CollectionsQuery['collections']['nodes'][0];

    data: ProductInformationSectionProps;
  },
) {
  const loaderData = useLoaderData<typeof loader>();
  const {collection, data} = props;
  const variantsPromise = loaderData.variants;
  const aspectRatio = getAspectRatioData(data.mediaAspectRatio);
  const {product} = useProduct();


  const shopifyTitle = data.richtext?.find(
    (block) => block._type === 'shopifyTitle'
  ) as ShopifyTitleBlockProps;

  if (variantsPromise) {
    return (
      <>
        <div className="container align-right mx-auto mb-7">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
              <BreadcrumbLink
                  href={
                    product?.title === 'Collar Pudú' || product?.title === 'Collar Chucao'
                      ? '/collections/fauna'
                      : product?.title === 'Aros Amanita Galáctica'
                      ? '/collections/funga'
                      : '/collections/'
                  }
                > 
                  {product?.title === 'Collar Pudú' || product?.title === 'Collar Chucao'
                    ? 'Fauna'
                    : product?.title === 'Aros Amanita Galáctica'
                    ? 'Funga'
                    : 'Colecciones'}
                    
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage><div className='text-custom'>{product?.title}</div></BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Suspense
          fallback={
            <Skeleton>
              <ProductInformationGrid
                data={vercelStegaCleanAll(data)}
                mediaGallery={<MediaGallery aspectRatio={aspectRatio} />}
                productDetails={<ProductDetails data={data} />}
                shopifyTitle={shopifyTitle}
              />
            </Skeleton>
          }
        >
          <Await
            errorElement={
              <Skeleton isError>
                <ProductInformationGrid
                  data={vercelStegaCleanAll(data)}
                  mediaGallery={<MediaGallery aspectRatio={aspectRatio} />}
                  productDetails={<ProductDetails data={data} />}
                  shopifyTitle={shopifyTitle}
                />
              </Skeleton>
            }
            resolve={variantsPromise}
          >
            {({product}) => {
              const variants = product?.variants?.nodes.length
                ? flattenConnection(product.variants)
                : [];

              return (
                <ProductVariantsContext.Provider value={{variants}}>
                  <ProductInformationGrid
                    data={vercelStegaCleanAll(data)}
                    mediaGallery={<MediaGallery aspectRatio={aspectRatio} />}
                    productDetails={<ProductDetails data={data} />}
                    shopifyTitle={shopifyTitle}
                  />
                </ProductVariantsContext.Provider>
              );
            }}
          </Await>
        </Suspense>
      </>
    );
  }

  return (
    <ProductInformationGrid
      data={vercelStegaCleanAll(data)}
      mediaGallery={<MediaGallery aspectRatio={aspectRatio} />}
      productDetails={<ProductDetails data={data} />}
      shopifyTitle={shopifyTitle}
    />
  );
}

function ProductInformationGrid({
  data,
  mediaGallery,
  productDetails,
  
}: {
  data: ProductInformationSectionProps;
  mediaGallery: React.ReactNode;
  productDetails: React.ReactNode;
  shopifyTitle: ShopifyTitleBlockProps;
}) {
  const {product} = useProduct();

  const desktopMediaPosition = data?.desktopMediaPosition;
  const desktopMediaWidth = data?.desktopMediaWidth;

  return (
    <div className="lg:container">
      <div className={cn('grid gap-10 lg:grid-cols-12')}>
        <div
          className={cn(
            'lg:col-span-6',
            desktopMediaPosition === 'right' && 'lg:order-last',
            desktopMediaWidth === 'small' && 'lg:col-span-5',
            desktopMediaWidth === 'large' && 'lg:col-span-7',
          )}
        >
          {mediaGallery}
        </div>
        <div
          className={cn(
            'lg:col-span-6',
            desktopMediaWidth === 'small' && 'lg:col-span-7',
            desktopMediaWidth === 'large' && 'lg:col-span-5',
            '-mt-10 lg:mt-0', // Add margin-top on mobile devices
          )}
        >
          {productDetails}
          <Accordion type="single" collapsible className="mt-4 w-full px-6 sm:px-0">
  <AccordionItem value="item-1">
    <AccordionTrigger>Detalles</AccordionTrigger>
    <AccordionContent>
      {(() => {
        switch (product?.title) {
          case 'Collar Pudú':
            return <div>Special content for collar pudu product.</div>;
          case 'Collar Chucao':
            return <div>Special content for collar chuchao.</div>;
          case 'Collar Monito del Monte':
            return <div>Hey.</div>;
          default:
            return <div>Yes. It adheres to the WAI-ARIA design pattern.</div>;
        }
      })()}
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that matches the other components&apos; aesthetic.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that matches the other components&apos; aesthetic.
    </AccordionContent>
  </AccordionItem>
</Accordion>
        </div>
      </div>
    </div>
  );
}

export const ProductVariantsContext = createContext<ProductVariantsContextType | null>(null);

export function useProductVariants() {
  return useContext(ProductVariantsContext);
}
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
import { Separator } from "../ui/separator"

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
                    product?.title === 'Collar Pudú' ||
                    product?.title === 'Collar Chucao' ||
                    product?.title === 'Collar Monito del Monte' ||
                    product?.title === 'Collar Puma' ||
                    product?.title === 'Aros Pudú'
                    ? '/collections/fauna'
                    : product?.title === 'Aros Amanita Galáctica 1' ||
                    product?.title === 'Aros Amanita Galáctica 2' ||
                    product?.title === 'Collar Mycena Cyanocephala' ||
                    product?.title === 'Aros Mycena Cyanocephala' ||
                    product?.title === 'Aros Cortinarius Magellanicus' ||
                    product?.title === 'Collar Cortinarius Magellanicus' ||
                    product?.title === 'Aros Amanita Muscaria' ||
                    product?.title === 'Collar Amanita Muscaria'
                    ? '/collections/funga'
                    : '/collections/flora'
                    }
                > 
                                      {product?.title === 'Collar Pudú' ||
                    product?.title === 'Collar Chucao' ||
                    product?.title === 'Collar Monito del Monte' ||
                    product?.title === 'Collar Puma' ||
                    product?.title === 'Aros Pudú'
                    ? 'Fauna'
                    : product?.title === 'Aros Amanita Galáctica 1' ||
                    product?.title === 'Aros Amanita Galáctica 2' ||
                    product?.title === 'Collar Mycena Cyanocephala' ||
                    product?.title === 'Aros Mycena Cyanocephala' ||
                    product?.title === 'Aros Cortinarius Magellanicus' ||
                    product?.title === 'Collar Cortinarius Magellanicus' ||
                    product?.title === 'Aros Amanita Muscaria' ||
                    product?.title === 'Collar Amanita Muscaria'
                    ? 'Funga'
                    : 'Flora'}
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
          <Accordion type="single" collapsible className="mt-4  mx-8  2xl:mx-0   md:mx-8  sm:mx-8">
  <AccordionItem value="item-1">
    <AccordionTrigger>Especificaciones del producto</AccordionTrigger>
    <AccordionContent>
      {(() => {
        switch (product?.title) {
          case 'Collar Pudú':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div>Cristal swarovski de corazón.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho pudú: 1,7 cm</div>
                <div>Alto pudú: 1,5 cm</div>
                <div>Largo cadena: 45 cm</div>
              </div>
            );
          case 'Collar Chucao':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho chucao: 1,6 cm</div>
                <div>Alto chucao: 1,4 cm</div>
                <div>Largo cadena: 45 cm</div>
              </div>
            );
          case 'Collar Monito del Monte':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div>Dije de luna bañado en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho monito del monte: 1 cm</div>
                <div>Alto monito del monte: 2 cm</div>
                <div>Largo cadena: 45 cm</div>
              </div>
            );
          case 'Aros de la paciencia':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho flores: 5 cm</div>
                <div>Alto flores: 7 cm</div>
              </div>
            );
          case 'Collar Puma':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div>Cristal swarovski de corazón.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho puma: 1,5 cm</div>
                <div>Alto puma: 2 cm</div>
                <div>Largo cadena: 45 cm</div>
              </div>
            );
          case 'Aros Amanita Galáctica 1':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div>Perlas de río.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho amanita: 5 cm</div>
                <div>Alto amanita: 1,6 cm</div>
              </div>
            );
            case 'Aros Amanita Galáctica 2':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div>Perlas de río.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho amanita: 5 cm</div>
                <div>Alto amanita: 1,6 cm</div>
              </div>
            );
          case 'Collar de la paciencia':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho flor: 5 cm.</div>
                <div>Alto flor: 3,5 cm.</div>
                <div>Largo cadena: 45 cm.</div>
              </div>
            );
          case 'Aros Monstera deliciosa':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho monstera: 1,3 cm</div>
                <div>Alto monstera: 1,3 cm</div>
              </div>
            );
          case 'Aros Pudú':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho pudúes: 2 cm</div>
                <div>Alto pudúes: 1,5 cm</div>
              </div>
            );
          case 'Collar Mycena Cyanocephala':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongo:  1,5 cm.</div>
                <div>Alto hongo:  2,3 cm.</div>
                <div>Largo cadena: 45 cm.</div>
              </div>
            );
          case 'Aros Mycena Cyanocephala':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongos: 1,5 cm.</div>
                <div>Alto hongos:  2,3 cm.</div>              
              </div>
            );
          case 'Aros Cortinarius Magellanicus':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongos: 1,3 cm.</div>
                <div>Alto hongos: 2,2 cm.</div>              
              </div>
            );
          case 'Aros Cortinarius Magellanicus':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongos: 1,3 cm.</div>
                <div>Alto hongos: 2,2 cm.</div>              
              </div>
            );
          case 'Collar Cortinarius Magellanicus':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongo: 1,2 cm.</div>
                <div>Alto hongo: 1,3 cm.</div>
                <div>Largo cadena: 45 cm.</div>              
              </div>
            );
          case 'Aros Amanita Muscaria':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongos: 1,8 cm.</div>
                <div>Alto hongos: 2,3 cm.</div>            
              </div>
            );
          case 'Collar Amanita Muscaria':
            return (
              <div>
                <div className='text-base'>Materialidad:</div>
                <div>Arcilla polimérica y resina UV.</div>
                <div>Fornituras bañadas en oro.</div>
                <div className='mt-4 '></div>
                <div className='text-base'>Dimensiones:</div>
                <div>Ancho hongo: 1,8 cm.</div>
                <div>Alto hongo: 2,3 cm.</div>
                <div>Largo cadena: 45 cm.</div>              
              </div>
            );                  
        }
      })()}
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Cuidados</AccordionTrigger>
    <AccordionContent>
    <div>No exponer al sol directo, agua o humedad.</div>
                <div>Evitar el contacto con cosméticos (perfume, crema, maquillaje, etc).</div>
                <div>No utilizar al dormir o durante actividades físicas.</div>
                <div>Limpiar con un paño o pincel suave y seco.</div>
                <div>Mantener la joya dentro de su estuche.</div>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Envío y promociones</AccordionTrigger>
    <AccordionContent>
    <div>Envíos a todo Chile por pagar.</div>
                <div>Envío gratis por compras sobre $60.000.</div>
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
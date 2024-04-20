import type { LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, Link } from '@remix-run/react';
import { getPaginationVariables } from '@shopify/hydrogen';
import { json } from '@shopify/remix-oxygen';
import { CollectionListGrid } from '~/components/CollectionListGrid';
import { COLLECTIONS_QUERY } from '~/graphql/queries';
import { useSanityRoot } from '~/hooks/useSanityRoot';
import { seoPayload } from '~/lib/seo.server';
import { Card, CardHeader, CardBody, CardFooter, Button, Image } from "@nextui-org/react";
import { Spacer } from "@nextui-org/react";

const PAGINATION_SIZE = 4;

export const loader = async ({
  context: { storefront },
  request,
}: LoaderFunctionArgs) => {
  const variables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });

  const { collections } = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json({ collections, seo });
};

export default function Collections() {
  const data = useLoaderData<typeof loader>();
  const themeContent = useSanityRoot().data?.themeContent;

  return (
    
    <div className="container mx-auto py-20">
    <h1 className="text-4xl font-light text-center mb-10 text-custom">Explora nuestras colecciones</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
      <Card isFooterBlurred className="w-4/5 md:w-full">
        <Link to="/collections/flora">
          <Image
            isZoomed
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="/images/1.jpg"
          />
          <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
            <div>
              <p className="text-custom4 text-2xl">Flora</p>
            </div>
            <div className="bg-[#dda1a5] text-custom4 shadow-lg px-4 py-2 rounded-full text-sm font-semibold">
              Ver productos
            </div>
          </CardFooter>
        </Link>
      </Card>
      <Card isFooterBlurred className="w-4/5 md:w-full">
        <Link to="/collections/fauna">
          <Image
            isZoomed
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="/images/2.jpg"
          />
          <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
            <div>
              <p className="text-custom4 text-2xl">Fauna</p>
            </div>
            <div className="bg-[#dda1a5] text-custom4 shadow-lg px-4 py-2 rounded-full text-sm font-semibold">
              Ver productos
            </div>
          </CardFooter>
        </Link>
      </Card>
      <Card isFooterBlurred className="w-4/5 md:w-full">
        <Link to="/collections/funga">
          <Image
            isZoomed
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="/images/3.jpg"
          />
          <CardFooter className="absolute bg-white/30 bottom-0 border-zinc-100/50 z-10 justify-between">
            <div>
              <p className="text-custom4 text-2xl">Funga</p>
            </div>
            <div className="bg-[#dda1a5] text-custom4 shadow-lg px-4 py-2 rounded-full text-sm font-semibold">
              Ver productos
            </div>
          </CardFooter>
        </Link>
      </Card>
    </div>
      <p className="pt-32 text-2xl font-italic text-right mb-10 text-custom">Cada vez que la belleza de la naturaleza se revela de repente ante nosotros, casi siempre logra liberarnos, aunque sea por un momento, de nuestras preocupaciones y deseos, llevándonos a un estado de tranquilidad y entendimiento. Esto es por qué una sola mirada hacia la naturaleza puede revivir, animar y restaurar a alguien que está atormentado por la pasión, la necesidad o la preocupación. En ese momento, al liberarnos de nuestras preocupaciones y deseos, entramos en un mundo donde todo lo que nos influenció y nos causó problemas está ausente.</p>
      <p className="text-2xl font-italic text-right mb-10 text-custom">- Arthur Schopenhauer</p>
    </div>
  );
}
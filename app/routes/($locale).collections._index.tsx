import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {CollectionListGrid} from '~/components/CollectionListGrid';
import {COLLECTIONS_QUERY} from '~/graphql/queries';
import {useSanityRoot} from '~/hooks/useSanityRoot';
import {seoPayload} from '~/lib/seo.server';
import {Card, CardHeader, CardBody, Image} from "@nextui-org/react";
import {Spacer} from "@nextui-org/react";

const PAGINATION_SIZE = 4;

export const loader = async ({
  context: {storefront},
  request,
}: LoaderFunctionArgs) => {
  const variables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });

  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
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

  return json({collections, seo});
};

export default function Collections() {
  const data = useLoaderData<typeof loader>();
  const themeContent = useSanityRoot().data?.themeContent;

  return (
    
    <div className="flex mx-auto justify-center container py-20">
      <Card className="py-4">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">Deva Joyería</p>
          <small className="text-default-500">12</small>
          <h1 className="font-bold text-2xl">Flora</h1>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Link to="/collections/flora">
            <Image
              isZoomed
              alt="Card background"
              className="object-cover rounded-xl"
              src="/images/2.jpg"
              width={270}
            />
          </Link>
        </CardBody>
      </Card>

      <Spacer x={8} />

      <Card className="py-4">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">Daily Mix</p>
          <small className="text-default-500">12 Tracks</small>
          <h1 className="font-bold text-2xl">Fauna</h1>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Link to="/collections/fauna">
            <Image
              isZoomed
              alt="Card background"
              className="object-cover rounded-xl"
              src="/images/2.jpg"
              width={270}
            />
          </Link>
        </CardBody>
      </Card>

      <Spacer x={8} />

      <Card className="py-4">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">Daily Mix</p>
          <small className="text-default-500">12 Tracks</small>
          <h1 className="font-bold text-2xl">Funga</h1>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Link to="/collections/funga">
            <Image
              isZoomed
              alt="Card background"
              className="object-cover rounded-xl"
              src="/images/2.jpg"
              width={270}
            />
          </Link>
        </CardBody>
      </Card>

      <Spacer x={8} />
    </div>
  );
}
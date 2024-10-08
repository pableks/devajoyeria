import type {ShouldRevalidateFunction} from '@remix-run/react';
import type {CustomerAccessToken} from '@shopify/hydrogen/storefront-api-types';
import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from '@shopify/remix-oxygen';

import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useMatches,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import {Seo, useNonce} from '@shopify/hydrogen';
import {defer} from '@shopify/remix-oxygen';
import {DEFAULT_LOCALE} from 'countries';

import {Layout} from '~/components/layout/Layout';

import type {HydrogenSession} from './lib/hydrogen.session.server';

import faviconAsset from '../public/favicon.png';
import {CssVars} from './components/CssVars';
import {Fonts} from './components/Fonts';
import {generateSanityImageUrl} from './components/sanity/SanityImage';
import {Button} from './components/ui/Button';
import {useAnalytics} from './hooks/useAnalytics';
import {useLocalePath} from './hooks/useLocalePath';
import {useSanityThemeContent} from './hooks/useSanityThemeContent';
import {generateFontsPreloadLinks} from './lib/fonts';
import {resolveShopifyPromises} from './lib/resolveShopifyPromises';
import {sanityPreviewPayload} from './lib/sanity/sanity.payload.server';
import {seoPayload} from './lib/seo.server';
import {ROOT_QUERY} from './qroq/queries';
import tailwindCss from './styles/tailwind.css';
import {NextUIProvider} from "@nextui-org/react";

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  formMethod,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

export function links() {
  return [
    {
      href: 'https://cdn.shopify.com',
      rel: 'preconnect',
    },
    {
      href: 'https://shop.app',
      rel: 'preconnect',
    },
    {href: tailwindCss, rel: 'stylesheet'},
  ];
}

export const meta: MetaFunction<typeof loader> = (loaderData) => {
  const {data} = loaderData;
  // Preload fonts files to avoid FOUT (flash of unstyled text)
  const fontsPreloadLinks = generateFontsPreloadLinks({
    fontsData: data?.sanityRoot.data?.fonts,
  });

  return [
    {
      // Preconnect to the Sanity CDN before loading fonts
      href: 'https://cdn.sanity.io',
      rel: 'preconnect',
      tagName: 'link',
    },
    
    ...fontsPreloadLinks,
  ];
};

export async function loader({context, request}: LoaderFunctionArgs) {
  const {cart, env, locale, sanity, sanityPreviewMode, session, storefront} =
    context;
  const language = locale?.language.toLowerCase();
  const customerAccessToken = await session.get('customerAccessToken');

  const queryParams = {
    defaultLanguage: DEFAULT_LOCALE.language.toLowerCase(),
    language,
  };

  const rootData = Promise.all([
    sanity.query({
      groqdQuery: ROOT_QUERY,
      params: queryParams,
    }),
    storefront.query(`#graphql
      query layout {
        shop {
          id
        } 
      }
    `),
  ]);

  const [sanityRoot, layout] = await rootData;

  const seo = seoPayload.root({
    root: sanityRoot.data,
    sanity: {
      dataset: env.SANITY_STUDIO_DATASET,
      projectId: env.SANITY_STUDIO_PROJECT_ID,
    },
    url: request.url,
  });

  // validate the customer access token is valid
  const {headers, isLoggedIn} = await validateCustomerAccessToken(
    session,
    customerAccessToken,
  );

  const {
    collectionListPromise,
    featuredCollectionPromise,
    featuredProductPromise,
  } = resolveShopifyPromises({
    document: sanityRoot,
    request,
    storefront,
  });

  // defer the cart query by not awaiting it
  const cartPromise = cart.get();

  return defer(
    {
      analytics: {
        shopId: layout.shop.id,
        shopifySalesChannel: locale.salesChannel,
      },
      cart: cartPromise,
      collectionListPromise,
      env: {
        /*
         * Be careful not to expose any sensitive environment variables here.
         */
        NODE_ENV: env.NODE_ENV,
        PUBLIC_STORE_DOMAIN: env.PUBLIC_STORE_DOMAIN,
        PUBLIC_STOREFRONT_API_TOKEN: env.PUBLIC_STOREFRONT_API_TOKEN,
        PUBLIC_STOREFRONT_API_VERSION: env.PUBLIC_STOREFRONT_API_VERSION,
        SANITY_STUDIO_API_VERSION: env.SANITY_STUDIO_API_VERSION,
        SANITY_STUDIO_DATASET: env.SANITY_STUDIO_DATASET,
        SANITY_STUDIO_PROJECT_ID: env.SANITY_STUDIO_PROJECT_ID,
        SANITY_STUDIO_URL: env.SANITY_STUDIO_URL,
        SANITY_STUDIO_USE_PREVIEW_MODE: env.SANITY_STUDIO_USE_PREVIEW_MODE,
      },
      featuredCollectionPromise,
      featuredProductPromise,
      isLoggedIn,
      locale,
      sanityPreviewMode,
      sanityRoot,
      seo,
      ...sanityPreviewPayload({
        context,
        params: queryParams,
        query: ROOT_QUERY.query,
      }),
    },
    {headers},
  );
}

export default function App() {
  const nonce = useNonce();
  const {locale} = useRootLoaderData();
  const hasUserConsent = true;

  useAnalytics(hasUserConsent);

  return (
    <html lang={locale.language.toLowerCase()}>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <Meta />
        <Seo />
        <Fonts />
        <Links />
        <CssVars />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <NextUIProvider>

        <Layout>
          <Outlet />
        </Layout>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
        </NextUIProvider>

      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const nonce = useNonce();
  const routeError = useRouteError();
  const {locale} = useRootLoaderData();
  const isRouteError = isRouteErrorResponse(routeError);
  const {themeContent} = useSanityThemeContent();
  const errorStatus = isRouteError ? routeError.status : 500;
  const collectionsPath = useLocalePath({path: '/collections'});
  const navigate = useNavigate();

  let title = themeContent?.error?.serverError;
  let pageType = 'page';

  if (isRouteError) {
    title = themeContent?.error?.pageNotFound;
    if (errorStatus === 404) pageType = routeError.data || pageType;
  }

  return (
    <html lang={locale.language.toLowerCase()}>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <Meta />
        <Fonts />
        <Links />
        <CssVars />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
        <Layout>
          <section>
            <div className="container flex flex-col items-center justify-center py-20 text-center">
              <span>{errorStatus}</span>
              <h1 className="mt-5">{title}</h1>
              {errorStatus === 404 ? (
                <Button asChild className="mt-6" variant="secondary">
                  <Link to={collectionsPath}>
                    {themeContent?.cart?.continueShopping}
                  </Link>
                </Button>
              ) : (
                <Button
                  className="mt-6"
                  onClick={() => navigate(0)}
                  variant="secondary"
                >
                  {themeContent?.error?.reloadPage}
                </Button>
              )}
            </div>
          </section>
        </Layout>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

export const useRootLoaderData = () => {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
};

/**
 * Validates the customer access token and returns a boolean and headers
 * @see https://shopify.dev/docs/api/storefront/latest/objects/CustomerAccessToken
 *
 * @example
 * ```js
 * const {isLoggedIn, headers} = await validateCustomerAccessToken(
 *  customerAccessToken,
 *  session,
 * );
 * ```
 */
async function validateCustomerAccessToken(
  session: HydrogenSession,
  customerAccessToken?: CustomerAccessToken,
) {
  let isLoggedIn = false;
  const headers = new Headers();
  if (!customerAccessToken?.accessToken || !customerAccessToken?.expiresAt) {
    return {headers, isLoggedIn};
  }

  const expiresAt = new Date(customerAccessToken.expiresAt).getTime();
  const dateNow = Date.now();
  const customerAccessTokenExpired = expiresAt < dateNow;

  if (customerAccessTokenExpired) {
    session.unset('customerAccessToken');
    headers.append('Set-Cookie', await session.commit());
  } else {
    isLoggedIn = true;
  }

  return {headers, isLoggedIn};
}
function generateFaviconUrls() {
  return [
    {
      href: faviconAsset,
      rel: 'icon',
      tagName: 'link',
      type: 'image/png',
      sizes: '32x32',
    },
    {
      href: faviconAsset,
      rel: 'icon',
      tagName: 'link',
      type: 'image/png',
      sizes: '16x16',
    },
    {
      href: faviconAsset,
      rel: 'shortcut icon',
      tagName: 'link',
      type: 'image/png',
      sizes: '192x192',
    },
    {
      href: faviconAsset,
      rel: 'apple-touch-icon',
      tagName: 'link',
      type: 'image/png',
      sizes: '180x180',
    },
  ];


}

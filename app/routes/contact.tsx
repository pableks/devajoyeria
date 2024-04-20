// contact.tsx
import type { LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { AnalyticsPageType } from '@shopify/hydrogen';
import { defer } from '@shopify/remix-oxygen';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export async function loader({ request }: LoaderFunctionArgs) {
  return defer({
    analytics: {
      pageType: AnalyticsPageType.page,
    },
  });
}

export default function ContactPage() {
  const { analytics } = useLoaderData<typeof loader>();

  return (
    
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-3xl p-8">
        <h1 className="text-4xl font-light mb-8 text-center text-normal text-custom">Contacto</h1>
        <div className="flex flex-col space-y-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon icon="fluent:mail-20-regular" width="32" height="32" color="#AECB91" />
            </div>
            <div className="ml-4">
              <a
                href="mailto:equipo.deva@gmail.com"
                className="text-xl font-medium text-custom2 hover:text-custom2"
              >
                equipo.deva@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon icon="teenyicons:instagram-outline" width="28" height="28" color="#DDA1A5" />
            </div>
            <div className="ml-4">
              <a
                href="https://www.instagram.com/devajoyeria/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-medium text-custom3 hover:text-custom3"
              >
                @devajoyeria
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
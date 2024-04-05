import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import type { PartialObjectDeep } from 'type-fest/source/partial-deep';
import { vercelStegaCleanAll } from '@sanity/client/stega';
import { useSanityRoot } from '~/hooks/useSanityRoot';
import { cn, setShowTrailingZeroKeyValue } from '~/lib/utils';
import { useRootLoaderData } from '~/root';

export function ShopifyMoney({
  className,
  data,
}: {
  className?: string;
  data: PartialObjectDeep<
    MoneyV2,
    {
      recurseIntoArrays: true;
    }
  >;
}) {
  const { locale } = useRootLoaderData();
  const { data: sanityRootData } = useSanityRoot();
  const key = setShowTrailingZeroKeyValue(locale);
  const showCurrencyCodes = sanityRootData?.settings?.showCurrencyCodes;
  const showTrailingZeros = sanityRootData?.settings?.showTrailingZeros?.find(
    (k) => vercelStegaCleanAll(k) === key
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: showTrailingZeros ? 0 : 0,
    }).format(price);
  };

  return (
    <span className={cn('tabular-nums', className)}>
      {showCurrencyCodes ? 'CLP ' : ''}
      {formatPrice(parseFloat(data.amount ?? '0'))}
    </span>
  );
}
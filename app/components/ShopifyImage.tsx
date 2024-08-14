import type {HydrogenImageProps} from '@shopify/hydrogen-react/Image';
import type {ImageFragmentFragment} from 'storefrontapi.generated';
import {Image, parseGid} from '@shopify/hydrogen';
import {cn} from '~/lib/utils';

interface ShopifyImageProps extends HydrogenImageProps {
  className?: string;
  data: ImageFragmentFragment;
  showBorder?: boolean;
  showShadow?: boolean;
}

export function ShopifyImage({
  className,
  data,
  showBorder = true,
  showShadow = true,
  height,
  ...props
}: ShopifyImageProps) {
  const id = parseGid(data.id || undefined).id;

  // Check if height is a valid number
  const safeHeight = typeof height === 'number' && !isNaN(height) 
    ? height 
    : undefined;

  return (
    <span
      className={cn(
        'relative block overflow-hidden !p-0',
        showBorder &&
          'rounded-[--media-border-corner-radius] border-[rgb(var(--border)_/_var(--media-border-opacity))] [border-width:--media-border-thickness]',
        showShadow &&
          '[box-shadow:rgb(var(--shadow)_/_var(--media-shadow-opacity))_var(--media-shadow-horizontal-offset)_var(--media-shadow-vertical-offset)_var(--media-shadow-blur-radius)_0px]',
      )}
      id={id ? `img-${id}` : undefined}
    >
      <Image
        className={cn('relative z-[1]', className, '!p-0')}
        data={data}
        height={safeHeight}
        {...props}
      />
      {id && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #img-${id}::before {
                content: "";
                position: absolute;
                background: url(${data.thumbnail});
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                filter: blur(6px);
              }
            `.trim(),
          }}
        />
      )}
    </span>
  );
}
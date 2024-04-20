import type {PortableTextComponents} from '@portabletext/react';
import type {PortableTextBlock} from '@portabletext/types';
import type {TypeFromSelection} from 'groqd';

import {PortableText} from '@portabletext/react';
import {useMemo} from 'react';

import type {SectionDefaultProps} from '~/lib/type';
import type {IMAGE_BANNER_SECTION_FRAGMENT} from '~/qroq/sections';

import type {ButtonBlockProps} from '../sanity/richtext/components/ButtonBlock';
import {Image } from "@nextui-org/react";

import {
  Banner,
  BannerContent,
  BannerMedia,
  BannerMediaOverlay,
} from '../Banner';
import {SanityImage} from '../sanity/SanityImage';
import {ButtonBlock} from '../sanity/richtext/components/ButtonBlock';

type ImageBannerSectionProps = TypeFromSelection<
  typeof IMAGE_BANNER_SECTION_FRAGMENT
>;

export function ImageBannerSection(
  props: SectionDefaultProps & {data: ImageBannerSectionProps},
) {
  const {data} = props;
  const {contentAlignment, contentPosition, overlayOpacity} = data;

  // Todo: add encodeDataAttribute to SanityImage
  return (
    <Banner height={data.bannerHeight}>
      <BannerMedia>
      <Image
            radius='none'
            isZoomed
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="/images/portada.png"
          />
      </BannerMedia>
      <BannerMediaOverlay opacity={overlayOpacity} />
      <BannerContent
        contentAlignment={contentAlignment}
        contentPosition={contentPosition}
      >
        <BannerRichtext value={data.content as PortableTextBlock[]} />
      </BannerContent>
    </Banner>
  );
}

function BannerRichtext(props: {value?: PortableTextBlock[] | null}) {
  const components = useMemo(
    () => ({
      types: {
        button: (props: {value: ButtonBlockProps}) => (
          <ButtonBlock {...props.value} />
        ),
      },
    }),
    [],
  );

  if (!props.value) return null;

  return (
    <div className="space-y-4 text-balance [&_a:not(last-child)]:mr-4">
      <PortableText
        components={components as PortableTextComponents}
        value={props.value}
      />
    </div>
  );
}

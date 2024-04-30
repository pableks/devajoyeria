import type {
  Media_ExternalVideo_Fragment,
  Media_MediaImage_Fragment,
  Media_Model3d_Fragment,
  Media_Video_Fragment,
} from 'storefrontapi.generated';

import {useLoaderData} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import React, {useCallback, useState} from 'react';

import type {loader} from '~/routes/($locale).products.$productHandle';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import {useDevice} from '~/hooks/useDevice';
import {type AspectRatioData, cn} from '~/lib/utils';

import type {CarouselApi} from '../ui/Carousel';

import {ShopifyImage} from '../ShopifyImage';
import {Badge} from '../ui/Badge';
import {
  Carousel,
  CarouselContent,
  CarouselCounter,
  CarouselItem,
} from '../ui/Carousel';

type Media =
  | Media_ExternalVideo_Fragment
  | Media_MediaImage_Fragment
  | Media_Model3d_Fragment
  | Media_Video_Fragment;

export function MediaGallery(props: {aspectRatio?: AspectRatioData}) {
  const {product} = useLoaderData<typeof loader>();
  const medias = product?.media?.nodes.length
    ? flattenConnection(product.media)
    : [];
  const [activeMediaId, setActiveMediaId] = useState<null | string>(null);
  const selectedImage =
    medias.find((media) => media?.id === activeMediaId) || medias[0];

  if (!selectedImage) return null;

  return (
    <div>
      <div className="hidden lg:block">
      <MainMedia aspectRatio={props.aspectRatio} media={selectedImage} />
      </div>
      <MobileCarousel aspectRatio={props.aspectRatio} medias={medias} />
      <div className="lg:block items-center">
      <ThumbnailCarousel
        medias={medias}
        selectedImage={selectedImage}
        setActiveMediaId={setActiveMediaId}
      />
      </div>
    </div>
  );
}




function MainMedia({
  aspectRatio,
  media,
}: {
  aspectRatio?: AspectRatioData;
  media: Media;
}) {
  switch (media.__typename) {
    case 'MediaImage':
      return (
        media.image && (
          <ShopifyImage
            aspectRatio="3/4"
            className={cn('size-full object-cover', aspectRatio?.className)}
            data={media.image}
            decoding="sync"
            fetchpriority="high"
            loading="eager"
            showBorder={true}
            showShadow={false}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        )
      );
    case 'Video':
      // Render video component for Video media type
      break;
    case 'ExternalVideo':
      // Render external video component for ExternalVideo media type
      break;
    case 'Model3d':
      // Render 3D model component for Model3d media type
      break;
    default:
      return null;
  }
}

function MobileCarousel({
  aspectRatio,
  medias,
}: {
  aspectRatio?: AspectRatioData;
  medias: Media[];
}) {
  const device = useDevice();
  const isActive = medias.length > 1;
  const [resetVisible, setResetVisible] = useState(false);

  const resetZoom = () => setResetVisible(false);


  if (!isActive) {
    return (
      <div className="container lg:hidden">
        
        <MainMedia aspectRatio={aspectRatio} media={medias[0]} />
        
      </div>
    );
  }

  return (
    <Carousel
      className="[--slide-size:100%] [--slide-spacing:1rem] lg:hidden"
      opts={{
        active: isActive && device !== 'desktop',
      }}
    >
      <div className="relative">
      <TransformWrapper
      minScale={1}
              disablePadding={true}
                
              >
                <TransformComponent> 
        <CarouselContent className="px-[--slide-spacing]">
          {medias.map((media, index) => {
            return (
              
              <CarouselItem
                className="last:pr-[--slide-spacing] [&>span]:h-full"
                key={media.id}
              >
              
                {media.__typename === 'MediaImage' && media.image && (
                  
                  <ShopifyImage
                    aspectRatio="3/4"
                    className={cn(
                      'size-full object-cover',
                      aspectRatio?.className,
                    )}
                    data={media.image}
                    decoding={index === 0 ? 'sync' : 'async'}
                    fetchpriority={index === 0 ? 'high' : 'low'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes="100vw"
                  />
                 
                )}
                
              </CarouselItem>
              
            );
          })}
        </CarouselContent>
        </TransformComponent>
              </TransformWrapper>
        <div className="mt-3 flex items-center justify-center">
          <Badge variant="outline">
            <CarouselCounter>
              <span>{medias.length}</span>
            </CarouselCounter>
          </Badge>
        </div>
      </div>
    </Carousel>
  );
}

function ThumbnailCarousel({
  medias,
  selectedImage,
  setActiveMediaId,
}: {
  medias: Media[];
  selectedImage: Media;
  setActiveMediaId: React.Dispatch<React.SetStateAction<null | string>>;
}) {
  const device = useDevice();
  const slidesPerView = 4;
  const [api, setApi] = useState<CarouselApi>();

  const handleSelect = useCallback(
    (index: number, mediaId: string) => {
      api?.scrollTo(index);
      setActiveMediaId(mediaId);
    },
    [api, setActiveMediaId],
  );

  if (medias.length <= 1) return null;

  return (
    <div className="mt-3 align-center hidden lg:block">
      <Carousel
        className="[--slide-spacing:.5rem]"
        opts={{
          active: device === 'desktop' && slidesPerView < medias.length,
          containScroll: 'keepSnaps',
          dragFree: true,
        }}
        setApi={setApi}
        style={
          {
            '--slides-per-view': slidesPerView,
          } as React.CSSProperties
        }
      >
        <div className="flex items-center gap-2">
          <CarouselContent className="ml-0 py-1">
            {medias.map((media, index) => {
              return (
                <CarouselItem
                  className="px-[calc(var(--slide-spacing)/2)]"
                  key={media.id}
                >
                  {media.__typename === 'MediaImage' && media.image && (
                    <button
                      className={cn(
                        'overflow-hidden rounded-[--media-border-corner-radius] border-2 border-primary border-opacity-0 transition-opacity notouch:hover:border-opacity-100',
                        'ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        media.id === selectedImage.id && 'border-opacity-100',
                      )}
                      key={media.id}
                      onClick={() => handleSelect(index, media.id)}
                    >
                      <span className="sr-only">{`Thumbnail ${index + 1}`}</span>
                      <ShopifyImage
  aspectRatio="1/1"
  className="size-full object-cover"
  data={media.image}
  draggable="false"
  loading="eager"
  showBorder={false}
  showShadow={false}
  sizes="96px"
/>
                    </button>
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  );
}

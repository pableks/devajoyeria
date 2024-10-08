import type {Variants} from 'framer-motion';
import type {CSSProperties} from 'react';

import {Link, useLocation} from '@remix-run/react';
import {vercelStegaCleanAll} from '@sanity/client/stega';
import {cx} from 'class-variance-authority';
import {m, transform, useMotionValueEvent, useTransform} from 'framer-motion';
import React, {useEffect, useState} from 'react';

import {useBoundedScroll} from '~/hooks/useBoundedScroll';
import {useColorsCssVars} from '~/hooks/useColorsCssVars';
import {useLocalePath} from '~/hooks/useLocalePath';
import {useSanityRoot} from '~/hooks/useSanityRoot';
import {cn} from '~/lib/utils';

import {headerVariants} from '../cva/header';
import {DesktopNavigation} from '../navigation/DesktopNavigation';
import {MobileNavigation} from '../navigation/MobileNavigation';
import {CartDrawer} from './CartDrawer';
import {Logo} from './Logo';

export function Header() {
  const {data} = useSanityRoot();
  const header = data?.header;
  const logoWidth = header?.desktopLogoWidth
    ? `${header?.desktopLogoWidth}px`
    : null;
  const homePath = useLocalePath({path: '/'});
  const colorsCssVars = useColorsCssVars({
    selector: 'header',
    settings: header,
  });

  return (
    <HeaderWrapper>
      <style dangerouslySetInnerHTML={{__html: colorsCssVars}} />
      <div className="container relative"> {/* Add relative positioning here */}
        <div className="flex justify-center items-center"> {/* Center items here */}
          <Link className="group" prefetch="intent" to={homePath}>
            <Logo
              className="h-auto w-[var(--logoWidth)]"
              sizes={logoWidth}
              style={
                {
                  '--logoWidth': logoWidth || 'auto',
                } as CSSProperties
              }
            />
          </Link>
        </div>
        <div className="absolute pr-7 right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-0 md:gap-2"> {/* Add absolute positioning here */}
          <DesktopNavigation data={header?.menu} />
          <CartDrawer />
          <MobileNavigation data={header?.menu} />
        </div>
      </div>
    </HeaderWrapper>
  );
}


function HeaderWrapper(props: {children: React.ReactNode}) {
  const {data} = useSanityRoot();
  const header = data?.header;
  const showSeparatorLine = header?.showSeparatorLine;
  const blur = header?.blur;
  const sticky = vercelStegaCleanAll(header?.sticky);

  const headerClassName = cx([
    'section-padding bg-background text-foreground',
    sticky !== 'none' && 'sticky top-0 z-50',
    headerVariants({
      optional: showSeparatorLine ? 'separator-line' : null,
    }),
  ]);

  return (
    <>
      {sticky === 'onScrollUp' ? (
        <HeaderAnimation className={headerClassName}>
          {props.children}
        </HeaderAnimation>
      ) : (
        <header className={headerClassName}>{props.children}</header>
      )}
      <HeaderHeightCssVars />
    </>
  );
}

function HeaderAnimation(props: {
  children: React.ReactNode;
  className: string;
}) {
  const {pathname} = useLocation();
  const [activeVariant, setActiveVariant] = useState<
    'hidden' | 'initial' | 'visible'
  >('initial');
  const desktopHeaderHeight = useHeaderHeigth()?.desktopHeaderHeight || 0;
  const {scrollYBoundedProgress} = useBoundedScroll(250);
  const scrollYBoundedProgressDelayed = useTransform(
    scrollYBoundedProgress,
    [0, 0.75, 1],
    [0, 0, 1],
  );

  useEffect(() => {
    // Reset the header position on route change
    setActiveVariant('initial');
  }, [pathname]);

  useMotionValueEvent(scrollYBoundedProgressDelayed, 'change', (latest) => {
    if (latest === 0) {
      setActiveVariant('visible');
    } else if (latest > 0.5) {
      setActiveVariant('hidden');
    } else {
      setActiveVariant('visible');
    }

    const newDesktopHeaderHeight = transform(
      latest,
      [0, 1],
      [`${desktopHeaderHeight}px`, '0px'],
    );

    // Reassign header height css var on scroll
    document.documentElement.style.setProperty(
      '--desktopHeaderHeight',
      newDesktopHeaderHeight,
    );
  });

  const variants: Variants = {
    hidden: {
      transform: 'translateY(-100%)',
    },
    initial: {
      transform: 'translateY(0)',
      transition: {
        duration: 0,
      },
    },
    visible: {
      transform: 'translateY(0)',
    },
  };

  // Header animation inspired by the fantastic Build UI recipes
  // (Check out the original at: https://buildui.com/recipes/fixed-header)
  // Credit to the Build UI team for the awesome Header animation.
  return (
    <>
      <m.header
        animate={activeVariant}
        className={cn(props.className)}
        initial="visible"
        transition={{
          duration: 0.2,
        }}
        variants={variants}
      >
        {props.children}
      </m.header>
    </>
  );
}

function HeaderHeightCssVars() {
  const desktopHeaderHeight = useHeaderHeigth()?.desktopHeaderHeight || 0;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { --desktopHeaderHeight: ${desktopHeaderHeight}px; }`,
      }}
    />
  );
}

function useHeaderHeigth() {
  const {data} = useSanityRoot();
  const headerPadding = {
    bottom: data?.header?.padding?.bottom || 0,
    top: data?.header?.padding?.top || 0,
  };
  const desktopLogoWidth = data?.header?.desktopLogoWidth || 1;
  const headerBorder = data?.header?.showSeparatorLine ? 1 : 0;
  const sanitySettings = data?.settings;
  const logo = sanitySettings?.logo;
  const desktopLogoHeight =
    logo?._ref && logo?.width && logo?.height
      ? (desktopLogoWidth * logo?.height) / logo?.width
      : 44;

  const desktopHeaderHeight = (
    desktopLogoHeight + 
    headerPadding.top +
    headerPadding.bottom +
    headerBorder
  ).toFixed(2);

  return {desktopHeaderHeight};
}

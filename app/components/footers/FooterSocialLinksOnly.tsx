import type {TypeFromSelection} from 'groqd';

import type {SectionDefaultProps} from '~/lib/type';
import type {FOOTER_SOCIAL_LINKS_ONLY_FRAGMENT} from '~/qroq/footers';

import {useColorsCssVars} from '~/hooks/useColorsCssVars';

import {SocialMediaButtons} from '../SocialMedia';
import {CountrySelector} from '../layout/CountrySelector';

type FooterSocialLinksOnlyProps = TypeFromSelection<
  typeof FOOTER_SOCIAL_LINKS_ONLY_FRAGMENT
>;

export function FooterSocialLinksOnly(
  props: SectionDefaultProps & {data: FooterSocialLinksOnlyProps},
) {
  const {data} = props;
  const colorsCssVars = useColorsCssVars({
    selector: '#country-selector',
    settings: data.settings,
  });

  return (
    <div className="container flex flex-col items-center justify-center gap-5">
      <style dangerouslySetInnerHTML={{__html: colorsCssVars}} />
     
      <CountrySelector />
      <p className="mt-4">{data.copyright}</p>
    </div>
  );
}
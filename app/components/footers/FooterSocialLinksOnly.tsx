import type { TypeFromSelection } from 'groqd';
import type { SectionDefaultProps } from '~/lib/type';
import type { FOOTER_SOCIAL_LINKS_ONLY_FRAGMENT } from '~/qroq/footers';
import { useColorsCssVars } from '~/hooks/useColorsCssVars';
import { SocialMediaButtons } from '../SocialMedia';
import { CountrySelector } from '../layout/CountrySelector';

type FooterSocialLinksOnlyProps = TypeFromSelection<
  typeof FOOTER_SOCIAL_LINKS_ONLY_FRAGMENT
>;

export function FooterSocialLinksOnly(
  props: SectionDefaultProps & { data: FooterSocialLinksOnlyProps }
) {
  const { data } = props;
  const colorsCssVars = useColorsCssVars({
    selector: '#country-selector',
    settings: data.settings,
  });

  return (
    <div className="container flex flex-col items-center justify-center gap-5">
      <style dangerouslySetInnerHTML={{ __html: colorsCssVars }} />
      <p className="mt-4 items-center">{data.copyright}</p>
      <p className="mt-4 items-center">
        UI design by trypablo
        <br />
        <a
          href="https://trypablo.tech/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm items-center"
        >
          https://trypablo.tech/
        </a>
      </p>
    </div>
  );
}
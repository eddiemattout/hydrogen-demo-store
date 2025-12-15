import {type MetaArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useRouteLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {PageHeader, Section, Text, Heading} from '~/components/Text';
import {Button} from '~/components/Button';
import {Link} from '~/components/Link';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import type {RootLoader} from '~/root';

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {language, country} = storefront.i18n;

  const seo = seoPayload.customPage({
    title: 'Accessibility Statement',
    description:
      'Our commitment to web accessibility and compliance with WCAG 2.1 AA standards and European accessibility directives.',
    url: request.url,
  });

  return {
    seo,
    locale: {language, country},
  };
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function AccessibilityStatement() {
  const {locale} = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const shopName = rootData?.layout?.shop?.name || 'Our Store';

  const lastUpdated = new Date().toLocaleDateString(
    locale.language.toLowerCase(),
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <>
      <Section
        padding="all"
        display="flex"
        className="flex-col items-baseline w-full gap-8 md:flex-row"
      >
        <PageHeader
          heading="Accessibility Statement"
          className="grid items-start flex-grow gap-4 md:sticky top-36 md:w-5/12"
        >
          <Button className="justify-self-start" variant="inline" to="/">
            &larr; Back to Home
          </Button>
        </PageHeader>
        <div className="flex-grow w-full md:w-7/12">
          <article className="prose dark:prose-invert max-w-none">
            <section aria-labelledby="commitment-heading">
              <Heading as="h2" id="commitment-heading" size="lead">
                Our Commitment to Accessibility
              </Heading>
              <Text as="p" className="mb-4">
                {shopName} is committed to ensuring digital accessibility for
                people with disabilities. We are continually improving the user
                experience for everyone and applying the relevant accessibility
                standards to ensure we provide equal access to all users.
              </Text>
            </section>

            <section aria-labelledby="standards-heading" className="mt-8">
              <Heading as="h2" id="standards-heading" size="lead">
                Conformance Status
              </Heading>
              <Text as="p" className="mb-4">
                The Web Content Accessibility Guidelines (WCAG) defines
                requirements for designers and developers to improve
                accessibility for people with disabilities. It defines three
                levels of conformance: Level A, Level AA, and Level AAA.{' '}
                {shopName} is partially conformant with WCAG 2.1 level AA. This
                means that some parts of the content may not fully conform to
                the accessibility standard.
              </Text>
            </section>

            <section aria-labelledby="measures-heading" className="mt-8">
              <Heading as="h2" id="measures-heading" size="lead">
                Accessibility Measures
              </Heading>
              <Text as="p" className="mb-4">
                {shopName} takes the following measures to ensure accessibility:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>
                    Include accessibility as part of our mission statement
                  </Text>
                </li>
                <li>
                  <Text>
                    Integrate accessibility into our procurement practices
                  </Text>
                </li>
                <li>
                  <Text>
                    Provide continual accessibility training for staff
                  </Text>
                </li>
                <li>
                  <Text>
                    Assign clear accessibility goals and responsibilities
                  </Text>
                </li>
                <li>
                  <Text>
                    Employ formal accessibility quality assurance methods
                  </Text>
                </li>
              </ul>
            </section>

            <section aria-labelledby="features-heading" className="mt-8">
              <Heading as="h2" id="features-heading" size="lead">
                Accessibility Features
              </Heading>
              <Text as="p" className="mb-4">
                Our website includes the following accessibility features:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>
                    Keyboard navigation support for all interactive elements
                  </Text>
                </li>
                <li>
                  <Text>Skip links to bypass repetitive content</Text>
                </li>
                <li>
                  <Text>
                    ARIA labels and landmarks for screen reader compatibility
                  </Text>
                </li>
                <li>
                  <Text>
                    Color contrast ratios meeting WCAG 2.1 AA standards
                  </Text>
                </li>
                <li>
                  <Text>Focus indicators for keyboard users</Text>
                </li>
                <li>
                  <Text>
                    Responsive design for various devices and zoom levels
                  </Text>
                </li>
                <li>
                  <Text>Alternative text for images</Text>
                </li>
                <li>
                  <Text>Form labels and error messages</Text>
                </li>
                <li>
                  <Text>Reduced motion support for users who prefer it</Text>
                </li>
              </ul>
            </section>

            <section aria-labelledby="eu-compliance-heading" className="mt-8">
              <Heading as="h2" id="eu-compliance-heading" size="lead">
                European Accessibility Compliance
              </Heading>
              <Text as="p" className="mb-4">
                This website strives to comply with the European Accessibility
                Act (Directive (EU) 2019/882) and the Web Accessibility
                Directive (Directive (EU) 2016/2102). We are committed to making
                our digital services accessible to all users across the European
                Union.
              </Text>
            </section>

            <section aria-labelledby="assistive-heading" className="mt-8">
              <Heading as="h2" id="assistive-heading" size="lead">
                Compatibility with Assistive Technologies
              </Heading>
              <Text as="p" className="mb-4">
                Our website is designed to be compatible with the following
                assistive technologies:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>Screen readers (NVDA, JAWS, VoiceOver)</Text>
                </li>
                <li>
                  <Text>Screen magnification software</Text>
                </li>
                <li>
                  <Text>Speech recognition software</Text>
                </li>
                <li>
                  <Text>Keyboard-only navigation</Text>
                </li>
              </ul>
            </section>

            <section aria-labelledby="limitations-heading" className="mt-8">
              <Heading as="h2" id="limitations-heading" size="lead">
                Known Limitations
              </Heading>
              <Text as="p" className="mb-4">
                Despite our best efforts to ensure accessibility, there may be
                some limitations. Below is a description of known limitations
                and potential solutions:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>
                    Third-party content: Some content provided by third parties
                    may not be fully accessible. We are working with our
                    partners to improve this.
                  </Text>
                </li>
                <li>
                  <Text>
                    PDF documents: Some older PDF documents may not be fully
                    accessible. Please contact us for alternative formats.
                  </Text>
                </li>
              </ul>
            </section>

            <section aria-labelledby="feedback-heading" className="mt-8">
              <Heading as="h2" id="feedback-heading" size="lead">
                Feedback
              </Heading>
              <Text as="p" className="mb-4">
                We welcome your feedback on the accessibility of {shopName}.
                Please let us know if you encounter accessibility barriers:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>
                    Email:{' '}
                    <Link
                      to="mailto:accessibility@example.com"
                      className="underline"
                    >
                      accessibility@example.com
                    </Link>
                  </Text>
                </li>
                <li>
                  <Text>
                    Visit our{' '}
                    <Link to="/pages/contact" className="underline">
                      Contact page
                    </Link>
                  </Text>
                </li>
              </ul>
              <Text as="p" className="mb-4">
                We try to respond to feedback within 5 business days.
              </Text>
            </section>

            <section aria-labelledby="enforcement-heading" className="mt-8">
              <Heading as="h2" id="enforcement-heading" size="lead">
                Enforcement Procedure
              </Heading>
              <Text as="p" className="mb-4">
                If you are not satisfied with our response to your accessibility
                concern, you have the right to file a complaint with your
                national enforcement body. In the European Union, you can
                contact your national authority responsible for enforcing the
                Web Accessibility Directive.
              </Text>
            </section>

            <section aria-labelledby="technical-heading" className="mt-8">
              <Heading as="h2" id="technical-heading" size="lead">
                Technical Specifications
              </Heading>
              <Text as="p" className="mb-4">
                Accessibility of {shopName} relies on the following technologies
                to work with the particular combination of web browser and any
                assistive technologies or plugins installed on your computer:
              </Text>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <Text>HTML</Text>
                </li>
                <li>
                  <Text>WAI-ARIA</Text>
                </li>
                <li>
                  <Text>CSS</Text>
                </li>
                <li>
                  <Text>JavaScript</Text>
                </li>
              </ul>
              <Text as="p" className="mb-4">
                These technologies are relied upon for conformance with the
                accessibility standards used.
              </Text>
            </section>

            <section aria-labelledby="date-heading" className="mt-8">
              <Heading as="h2" id="date-heading" size="lead">
                Statement Last Updated
              </Heading>
              <Text as="p" className="mb-4">
                This statement was last updated on {lastUpdated}.
              </Text>
            </section>
          </article>
        </div>
      </Section>
    </>
  );
}

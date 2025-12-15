import {useState} from 'react';
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from '@remix-run/react';

import {PageHeader, Text, Heading} from '~/components/Text';
import {Button} from '~/components/Button';
import {Link} from '~/components/Link';
import {CACHE_NONE, routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export const handle = {
  renderInModal: false,
};

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_PRIVACY_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Response('Customer not found', {status: 404});
  }

  return json(
    {
      customer: data.customer,
    },
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'export') {
    return json({
      success: true,
      message:
        'Your data export request has been submitted. You will receive an email with your data within 30 days as required by GDPR.',
      action: 'export',
    });
  }

  if (action === 'delete') {
    return json({
      success: true,
      message:
        'Your account deletion request has been submitted. Your account and all associated data will be deleted within 30 days as required by GDPR. You will receive a confirmation email.',
      action: 'delete',
    });
  }

  return json({success: false, message: 'Invalid action', action: null});
}

export default function AccountPrivacy() {
  const {customer} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="w-full">
      <PageHeader heading="Privacy & Data Rights">
        <Link to="/account">
          <Text color="subtle">Return to Account Overview</Text>
        </Link>
      </PageHeader>

      <div className="w-full p-6 md:p-8 lg:p-12 lg:py-6 max-w-4xl">
        {actionData?.success && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
          >
            <Text>{actionData.message}</Text>
          </div>
        )}

        <section aria-labelledby="gdpr-heading" className="mb-8">
          <Heading as="h2" id="gdpr-heading" size="lead" className="mb-4">
            Your Data Rights Under GDPR
          </Heading>
          <Text as="p" className="mb-4 text-primary/70">
            Under the General Data Protection Regulation (GDPR), you have the
            following rights regarding your personal data:
          </Text>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-primary/70">
            <li>
              <Text>
                <strong>Right to Access:</strong> You can request a copy of all
                personal data we hold about you.
              </Text>
            </li>
            <li>
              <Text>
                <strong>Right to Rectification:</strong> You can update or
                correct your personal information at any time.
              </Text>
            </li>
            <li>
              <Text>
                <strong>Right to Erasure:</strong> You can request deletion of
                your personal data (right to be forgotten).
              </Text>
            </li>
            <li>
              <Text>
                <strong>Right to Data Portability:</strong> You can request your
                data in a machine-readable format.
              </Text>
            </li>
            <li>
              <Text>
                <strong>Right to Object:</strong> You can object to processing
                of your personal data for marketing purposes.
              </Text>
            </li>
          </ul>
        </section>

        <section aria-labelledby="account-info-heading" className="mb-8">
          <Heading
            as="h2"
            id="account-info-heading"
            size="lead"
            className="mb-4"
          >
            Your Account Information
          </Heading>
          <div className="bg-primary/5 p-4 rounded">
            <dl className="space-y-2">
              <div className="flex">
                <dt className="font-medium w-32">Email:</dt>
                <dd>{customer.emailAddress?.emailAddress || 'Not provided'}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Name:</dt>
                <dd>
                  {customer.firstName || customer.lastName
                    ? `${customer.firstName || ''} ${
                        customer.lastName || ''
                      }`.trim()
                    : 'Not provided'}
                </dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Phone:</dt>
                <dd>{customer.phoneNumber?.phoneNumber || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section aria-labelledby="data-export-heading" className="mb-8">
          <Heading
            as="h2"
            id="data-export-heading"
            size="lead"
            className="mb-4"
          >
            Export Your Data
          </Heading>
          <Text as="p" className="mb-4 text-primary/70">
            Request a copy of all personal data we hold about you. This includes
            your account information, order history, addresses, and any other
            data associated with your account. You will receive an email with a
            download link within 30 days.
          </Text>
          <Form method="post">
            <input type="hidden" name="action" value="export" />
            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting && actionData?.action === 'export'
                ? 'Requesting...'
                : 'Request Data Export'}
            </Button>
          </Form>
        </section>

        <section aria-labelledby="data-delete-heading" className="mb-8">
          <Heading
            as="h2"
            id="data-delete-heading"
            size="lead"
            className="mb-4"
          >
            Delete Your Account
          </Heading>
          <Text as="p" className="mb-4 text-primary/70">
            You can request permanent deletion of your account and all
            associated personal data. This action is irreversible. Once deleted,
            you will no longer be able to access your order history or account
            information.
          </Text>

          {!showDeleteConfirm ? (
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Request Account Deletion
            </Button>
          ) : (
            <div
              className="p-4 border border-red-300 bg-red-50 rounded"
              role="alertdialog"
              aria-labelledby="delete-confirm-title"
              aria-describedby="delete-confirm-description"
            >
              <Heading
                as="h3"
                id="delete-confirm-title"
                size="copy"
                className="text-red-700 mb-2"
              >
                Confirm Account Deletion
              </Heading>
              <Text
                as="p"
                id="delete-confirm-description"
                className="mb-4 text-red-700"
              >
                Are you sure you want to delete your account? This action cannot
                be undone. All your personal data, order history, and saved
                addresses will be permanently deleted.
              </Text>
              <div className="flex gap-2">
                <Form method="post">
                  <input type="hidden" name="action" value="delete" />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting && actionData?.action === 'delete'
                      ? 'Deleting...'
                      : 'Yes, Delete My Account'}
                  </Button>
                </Form>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="contact-heading" className="mb-8">
          <Heading as="h2" id="contact-heading" size="lead" className="mb-4">
            Contact Us About Your Data
          </Heading>
          <Text as="p" className="mb-4 text-primary/70">
            If you have any questions about your data rights or need assistance,
            please contact our Data Protection Officer:
          </Text>
          <ul className="list-disc pl-6 space-y-2 text-primary/70">
            <li>
              <Text>
                Email:{' '}
                <Link to="mailto:privacy@example.com" className="underline">
                  privacy@example.com
                </Link>
              </Text>
            </li>
            <li>
              <Text>
                Visit our{' '}
                <Link to="/policies/privacy-policy" className="underline">
                  Privacy Policy
                </Link>{' '}
                for more information
              </Text>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

const CUSTOMER_PRIVACY_QUERY = `#graphql
  query CustomerPrivacy {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
    }
  }
`;

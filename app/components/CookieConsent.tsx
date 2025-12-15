import {useState, useEffect, useCallback} from 'react';

import {Button} from '~/components/Button';
import {Text, Heading} from '~/components/Text';
import {Link} from '~/components/Link';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences) as CookiePreferences;
          setPreferences(parsed);
        } catch {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
    }
  }, []);

  const saveConsent = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allAccepted);
  }, [saveConsent]);

  const acceptNecessary = useCallback(() => {
    saveConsent(DEFAULT_PREFERENCES);
  }, [saveConsent]);

  const savePreferences = useCallback(() => {
    saveConsent(preferences);
  }, [preferences, saveConsent]);

  const togglePreference = useCallback((key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      aria-modal="true"
      className="fixed bottom-0 left-0 right-0 z-50 bg-contrast border-t border-primary/10 shadow-lg"
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <Heading as="h2" id="cookie-consent-title" size="lead">
                Cookie Consent
              </Heading>
              <Text
                as="p"
                id="cookie-consent-description"
                className="mt-2 text-primary/70"
              >
                We use cookies to enhance your browsing experience, serve
                personalized content, and analyze our traffic. By clicking
                &quot;Accept All&quot;, you consent to our use of cookies. You
                can customize your preferences or learn more in our{' '}
                <Link to="/policies/privacy-policy" className="underline">
                  Privacy Policy
                </Link>
                .
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowPreferences(true)}
                aria-expanded={showPreferences}
                aria-controls="cookie-preferences-panel"
              >
                Customize
              </Button>
              <Button variant="secondary" onClick={acceptNecessary}>
                Necessary Only
              </Button>
              <Button variant="primary" onClick={acceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div id="cookie-preferences-panel">
            <Heading as="h2" id="cookie-consent-title" size="lead">
              Cookie Preferences
            </Heading>
            <Text as="p" className="mt-2 text-primary/70 mb-4">
              Manage your cookie preferences below. Necessary cookies are
              required for the website to function and cannot be disabled.
            </Text>

            <div className="space-y-4 mb-6">
              <CookieCategory
                title="Necessary Cookies"
                description="These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas."
                checked={preferences.necessary}
                disabled
                onChange={() => {}}
              />
              <CookieCategory
                title="Analytics Cookies"
                description="These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."
                checked={preferences.analytics}
                onChange={() => togglePreference('analytics')}
              />
              <CookieCategory
                title="Marketing Cookies"
                description="These cookies are used to track visitors across websites to display relevant advertisements."
                checked={preferences.marketing}
                onChange={() => togglePreference('marketing')}
              />
              <CookieCategory
                title="Preference Cookies"
                description="These cookies enable the website to remember choices you make (such as your language or region) and provide enhanced features."
                checked={preferences.preferences}
                onChange={() => togglePreference('preferences')}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowPreferences(false)}
              >
                Back
              </Button>
              <Button variant="primary" onClick={savePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CookieCategory({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  const id = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-start gap-4 p-4 border border-primary/10 rounded">
      <div className="flex-1">
        <label htmlFor={id} className="font-medium text-primary cursor-pointer">
          {title}
        </label>
        <Text as="p" className="text-sm text-primary/70 mt-1">
          {description}
        </Text>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="w-5 h-5 rounded border-primary/30 text-primary focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-describedby={`${id}-description`}
        />
        <span id={`${id}-description`} className="sr-only">
          {description}
        </span>
      </div>
    </div>
  );
}

export function useCookiePreferences(): CookiePreferences {
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences) as CookiePreferences;
        setPreferences(parsed);
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, []);

  return preferences;
}

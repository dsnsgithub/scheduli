const LAST_UPDATED = "March 28, 2026";
const CONTACT_EMAIL = "scheduli-support@dsns.dev";

export default function Privacy() {
  return (
    <div className="container mx-auto my-10 px-4 max-w-3xl">
      <div className="shadow-xl bg-wedgewood-200 border-wedgewood-300 border-2 p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {LAST_UPDATED}</p>

        <Section title="1. Overview">
          <p>
            Scheduli ("we," "our," or "us") is a school schedule tracking app. This Privacy Policy
            explains what information we collect, how we use it, and your rights regarding that
            information. By using Scheduli, you agree to the practices described in this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <SubSection title="2.1 Information You Provide">
            <p>Scheduli does not require you to create an account or provide personal information such as your name, email address, or phone number.</p>
            <p className="mt-2">
              You may optionally enter custom names for schedule periods. This information is stored
              only on your device and is not transmitted to our servers.
            </p>
          </SubSection>

          <SubSection title="2.2 Schedule Data">
            <p>
              When you import a schedule — including from UC Irvine&apos;s WebReg system — the
              schedule data is downloaded from our servers or from the Anteater API and stored
              locally on your device. We do not store your imported schedule data on our servers
              after it is delivered to your device.
            </p>
          </SubSection>

          <SubSection title="2.3 Analytics and Usage Data">
            <p>
              We use <strong>PostHog</strong> to collect analytics and crash reports to help us
              improve the app. This includes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>App screens and features you visit</li>
              <li>Crash reports and error logs</li>
              <li>Network request telemetry (endpoint names and response status codes)</li>
              <li>
                Session recordings — video-like replays of your in-app interactions, including
                taps and screen transitions
              </li>
              <li>
                Text entered into input fields within the app (such as custom period names or
                pasted schedule import data) may be captured as part of session recordings
              </li>
              <li>
                Device information: device model, operating system version, app version, and
                language/locale settings
              </li>
              <li>A randomly generated anonymous device identifier</li>
            </ul>
            <p className="mt-2">
              This data is linked to an anonymous identifier and is not linked to your name or
              other identifying information. PostHog may store this data on servers located in the
              United States.
            </p>
          </SubSection>

          <SubSection title="2.4 Notifications">
            <p>
              If you grant notification permissions, Scheduli delivers local notifications on your
              device to remind you of upcoming schedule items. Notification data does not leave
              your device.
            </p>
          </SubSection>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information collected to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Operate and improve the app</li>
            <li>Diagnose crashes and fix bugs</li>
            <li>Understand which features are used so we can prioritize improvements</li>
            <li>Deliver schedule data you request</li>
          </ul>
          <p className="mt-2">We do not use your information for advertising or sell it to third parties.</p>
        </Section>

        <Section title="4. Third-Party Services">
          <p>Scheduli uses the following third-party services:</p>
          <div className="mt-3 space-y-3">
            <ThirdParty
              name="PostHog"
              purpose="Analytics, crash reporting, and session replay"
              privacy="https://posthog.com/privacy"
            />
            <ThirdParty
              name="Anteater API"
              purpose="Provides UC Irvine course and schedule data"
              privacy="https://anteaterapi.com"
            />
          </div>
          <p className="mt-3">
            Each third party has its own privacy policy governing their handling of data. We
            encourage you to review those policies.
          </p>
        </Section>

        <Section title="5. Data Retention and Storage">
          <p>
            Schedule data and your preferences are stored locally on your device using device
            storage. You can delete this data at any time by uninstalling the app or clearing the
            app&apos;s data through your device settings.
          </p>
          <p className="mt-2">
            Analytics data collected through PostHog is retained according to PostHog&apos;s
            data retention policy.
          </p>
        </Section>

        <Section title="6. Data Sharing">
          <p>We do not sell, rent, or trade your personal information. We may share data only:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              With PostHog as described in Section 4, solely to provide analytics services
            </li>
            <li>
              If required to do so by law or in response to a valid legal request
            </li>
          </ul>
        </Section>

        <Section title="7. Children's Privacy">
          <p>
            Scheduli is intended for use by students and is suitable for users of all ages.
            We do not knowingly collect personal information from children under 13. Because
            Scheduli does not require account creation, no personal information is collected
            directly from any user, including children. Anonymous analytics are collected as
            described above.
          </p>
          <p className="mt-2">
            If you are a parent or guardian and believe your child has provided personal
            information to us, please contact us at{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we
            will take steps to delete that information.
          </p>
        </Section>

        <Section title="8. Your Rights and Choices">
          <SubSection title="Opt Out of Analytics">
            <p>
              You may request that we disable analytics collection for your device by contacting
              us at{" "}
              <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </SubSection>
          <SubSection title="Delete Your Data">
            <p>
              All schedule and preference data is stored on your device. You can delete it at
              any time by clearing the app&apos;s data in your device settings or uninstalling
              the app. To request deletion of any analytics data associated with your anonymous
              device identifier, contact us at{" "}
              <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </SubSection>
          <SubSection title="California Residents (CCPA)">
            <p>
              California residents have the right to know what personal information is collected,
              request deletion of personal information, and opt out of the sale of personal
              information. We do not sell personal information. To exercise your rights, contact
              us at{" "}
              <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </SubSection>
          <SubSection title="EEA/UK Residents (GDPR)">
            <p>
              If you are located in the European Economic Area or United Kingdom, you have rights
              under the General Data Protection Regulation including the right to access, correct,
              or erase your data. Our legal basis for processing analytics data is our legitimate
              interest in improving app quality. To exercise your rights, contact us at{" "}
              <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </SubSection>
        </Section>

        <Section title="9. Security">
          <p>
            We take reasonable technical measures to protect the information we collect. Schedule
            and preference data on your device is protected by your device&apos;s built-in
            security. However, no method of electronic storage or transmission is 100% secure.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will post the updated policy
            on this page with a new &quot;Last updated&quot; date. Your continued use of Scheduli
            after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            <a className="underline font-medium" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-1">{title}</h3>
      {children}
    </div>
  );
}

function ThirdParty({
  name,
  purpose,
  privacy,
}: {
  name: string;
  purpose: string;
  privacy: string;
}) {
  return (
    <div className="pl-3 border-l-2 border-wedgewood-400">
      <p className="font-semibold">{name}</p>
      <p>{purpose}</p>
      <a className="underline text-blue-700" href={privacy} target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>
    </div>
  );
}

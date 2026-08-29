import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - MeetRiders",
  description: "Privacy Policy for MeetRiders - how we handle your data",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to Home
        </Link>
        
        <h1 className="mt-6 text-4xl font-black text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 29, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none mt-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              MeetRiders (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the MeetRiders mobile application and website at{" "}
              <a href="https://meet-riders.vercel.app" className="text-primary hover:underline">https://meet-riders.vercel.app</a>{" "}
              (&quot;Service&quot;). This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service.
              MeetRiders is a university-exclusive travel-sharing platform that helps students share commutes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground">2.1 Account Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>University email address (.edu verification) for account creation</li>
                  <li>Name, major, bio, and profile photo</li>
                  <li>Student verification status</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">2.2 Location Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Precise location (ACCESS_FINE_LOCATION)</strong> - to pin pickup/drop-off points and center the map</li>
                  <li><strong>Approximate location (ACCESS_COARSE_LOCATION)</strong> - to discover nearby rides</li>
                  <li>Location is collected only when you use the app and grant permission. You can deny location and still browse, but hosting/joining rides requires it.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">2.3 Media</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Profile photos and ride images via camera/gallery (READ_EXTERNAL_STORAGE / READ_MEDIA_IMAGES)</li>
                  <li>Images are stored in Supabase Storage</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">2.4 Usage Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Trip/party details you create (destination, transport mode, companions)</li>
                  <li>Ratings, ride history, and in-app interactions</li>
                  <li>Device information (OS, app version) for diagnostics</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>To create and manage your account and verify student status</li>
              <li>To show nearby parties on map/list and match riders</li>
              <li>To let hosts manage join requests and communicate</li>
              <li>To calculate cost sharing and improve the Service</li>
              <li>To send notifications about ride requests and updates</li>
              <li>We do <strong>not</strong> sell your data or show third-party ads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">4. Third-Party Services</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>We use trusted services to operate the app:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Supabase</strong> (PostgreSQL, Auth, Storage) - hosts our backend at hpzuzgccyusizsgvfhmr.supabase.co. Data is stored securely with Row Level Security.</li>
                <li><strong>Google Maps / OpenStreetMap (Leaflet)</strong> - for map display</li>
                <li><strong>Expo</strong> - for app delivery</li>
                <li>No analytics or advertising trackers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">5. Data Sharing</h2>
            <p className="text-muted-foreground">
              We share data only as needed: your public profile (name, major, bio, photo) and trip details are visible to other verified students when you host/join a party. We do not share location history publicly. We may disclose data if required by law or to protect safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We keep your account data while your account is active. You can request deletion at any time. Trip history is kept for your records until you delete your account. We may retain anonymized data for analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">7. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Access, update, or delete your profile in Settings</li>
              <li>Revoke location/photo permissions in device Settings</li>
              <li>Request account deletion: email <a href="mailto:patarylohitaksha06@gmail.com" className="text-primary hover:underline">patarylohitaksha06@gmail.com</a></li>
              <li>Opt out of non-essential notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">8. Security</h2>
            <p className="text-muted-foreground">
              We use industry-standard encryption (HTTPS, Supabase RLS) to protect data. No system is 100% secure, but we regularly review our protections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              The Service is for university students (18+). We do not knowingly collect data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">10. Permissions Explained</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Android permissions requested:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>ACCESS_FINE_LOCATION / COARSE_LOCATION</strong> - map centering and ride creation (optional, required to host)</li>
                <li><strong>CAMERA / READ_MEDIA_IMAGES / READ_EXTERNAL_STORAGE</strong> - picking profile/ride photos (optional)</li>
              </ul>
              <p>iOS: <strong>NSLocationWhenInUseUsageDescription</strong> - same purpose as Android location.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We will update this page and change the &quot;Last updated&quot; date. Continued use after changes means you accept the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">12. Contact Us</h2>
            <p className="text-muted-foreground">
              Questions? Contact: <a href="mailto:patarylohitaksha06@gmail.com" className="text-primary hover:underline">patarylohitaksha06@gmail.com</a>
              <br />
              Developer: Lohit Aksha (patarylohitaksha06@gmail.com) - Personal account ID: 5844050713225085106
            </p>
            <p className="mt-4 text-muted-foreground">
              If you are in the EU, you also have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              This policy also applies to the MeetRiders Android app (package: com.meetriders.app). By using the app, you agree to this policy.
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              <Link href="/" className="text-primary hover:underline">Home</Link>
              <a href="mailto:patarylohitaksha06@gmail.com" className="text-primary hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

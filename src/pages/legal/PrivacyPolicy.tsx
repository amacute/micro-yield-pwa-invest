
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: May 21, 2025</p>
      </div>
      
      <ScrollArea className="h-[60vh] rounded-md border p-6">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>At Axiomify, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our peer-to-peer investment platform. Please read this policy carefully to understand our practices regarding your personal data.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-2">We may collect several types of information from and about users of our Platform, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> This includes identifiers such as name, email address, postal address, phone number, date of birth, and identification documents for KYC verification.
              </li>
              <li>
                <strong>Financial Information:</strong> Bank account details, cryptocurrency wallet addresses, transaction history, and investment preferences.
              </li>
              <li>
                <strong>Technical Information:</strong> IP address, device information, browser type and version, time zone setting, operating system, and platform.
              </li>
              <li>
                <strong>Usage Information:</strong> Information about how you use our Platform, including pages visited, time spent on pages, and other interaction data.
              </li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">3. How We Collect Information</h2>
            <p className="mb-2">We collect information through various methods, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Direct interactions when you create an account, make investments, or contact us.</li>
              <li>Automated technologies such as cookies, web beacons, and similar tracking technologies.</li>
              <li>Third-party sources, including identity verification services, financial institutions, and public databases.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">4. How We Use Your Information</h2>
            <p className="mb-2">We may use the information we collect for various purposes, including to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our Platform and services.</li>
              <li>Process transactions and send related information.</li>
              <li>Verify your identity and prevent fraud or other illegal activities.</li>
              <li>Comply with legal obligations, including anti-money laundering and know-your-customer requirements.</li>
              <li>Communicate with you about your account, investments, and platform updates.</li>
              <li>Personalize your experience and provide targeted recommendations.</li>
              <li>Analyze usage patterns to improve our Platform and services.</li>
              <li>Protect the security and integrity of our Platform.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Disclosure of Your Information</h2>
            <p className="mb-2">We may disclose your personal information to the following categories of recipients:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as payment processing, data analysis, and customer support.
              </li>
              <li>
                <strong>Business Partners:</strong> Companies with whom we collaborate to offer joint services or promotions.
              </li>
              <li>
                <strong>Legal Authorities:</strong> Government agencies, regulatory bodies, or law enforcement when required by law or to protect our rights.
              </li>
              <li>
                <strong>Corporate Transactions:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </li>
            </ul>
            <p className="mt-4">We do not sell your personal information to third parties for their marketing purposes.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">7. International Data Transfers</h2>
            <p>Your information may be transferred to, and processed in, countries other than the one in which you reside. These countries may have data protection laws that differ from those in your country. We take steps to ensure that your information receives an adequate level of protection in the countries where we process it.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
            <p className="mb-2">Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access and obtain a copy of your personal information.</li>
              <li>The right to rectify inaccurate personal information.</li>
              <li>The right to request deletion of your personal information.</li>
              <li>The right to restrict or object to our processing of your personal information.</li>
              <li>The right to data portability.</li>
              <li>The right to withdraw consent at any time, where we rely on consent to process your personal information.</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us using the information provided in the "Contact Us" section below.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">9. Cookies and Similar Technologies</h2>
            <p>We use cookies and similar technologies to enhance your experience on our Platform. You can set your browser to refuse all or some browser cookies or to alert you when websites set or access cookies. If you disable or refuse cookies, some parts of our Platform may not function properly.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">10. Children's Privacy</h2>
            <p>Our Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">11. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">
              Axiomify, Inc.<br />
              Email: privacy@axiomify.com<br />
              Address: 123 Finance Street, Investment City, IN 12345
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

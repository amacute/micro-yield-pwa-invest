
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="text-muted-foreground">Last Updated: May 21, 2025</p>
      </div>
      
      <ScrollArea className="h-[60vh] rounded-md border p-6">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>Welcome to Axiomify, a peer-to-peer investment platform. These Terms and Conditions govern your use of our services and website. By using Axiomify, you agree to these terms in full. If you disagree with these terms or any part of them, you must not use our services.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>"Platform" refers to Axiomify, its website, mobile application, and related services.</li>
              <li>"User", "You", or "Your" refers to individuals who access and use the Platform.</li>
              <li>"Investment" refers to any financial contribution made through the Platform for potential returns.</li>
              <li>"Returns" refers to any profit, interest, or additional funds received as a result of an Investment.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Account Registration and Eligibility</h2>
            <p className="mb-2">To use our services, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years old or the legal age of majority in your jurisdiction.</li>
              <li>Have the legal capacity to enter into binding contracts.</li>
              <li>Complete the registration process truthfully and accurately.</li>
              <li>Maintain the security of your account credentials.</li>
              <li>Notify us immediately of any unauthorized access to your account.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Investment Terms</h2>
            <p className="mb-2">By making investments through the Platform, you acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All investments carry risk, including the potential loss of principal.</li>
              <li>Investment returns are not guaranteed and may vary from those advertised.</li>
              <li>The standard investment cycle is 72 hours, after which returns are disbursed.</li>
              <li>Minimum investment amount is $10, and maximum investment varies by opportunity.</li>
              <li>Axiomify charges fees as specified in the Fee Schedule section of these terms.</li>
              <li>Withdrawals may be subject to processing times and additional verification.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Risk Disclosure</h2>
            <p className="mb-4">Investing involves significant risks. Users should carefully consider their financial situation and risk tolerance before investing. Potential risks include but are not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Market risk: Fluctuations in financial markets may affect investment performance.</li>
              <li>Counterparty risk: The risk that the other party in an investment will not fulfill their obligations.</li>
              <li>Liquidity risk: The possibility that investments cannot be easily converted to cash without loss of value.</li>
              <li>Operational risk: The risk of loss resulting from inadequate or failed internal processes, people, and systems.</li>
              <li>Regulatory risk: Changes in laws and regulations that may adversely affect investments or the Platform.</li>
            </ul>
            <p className="mt-4 font-semibold">IMPORTANT: Past performance is not indicative of future results. Invest only what you can afford to lose.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">6. Fee Schedule</h2>
            <p className="mb-2">Axiomify charges the following fees for its services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform fee: 2.5% of the investment amount.</li>
              <li>Withdrawal fee: Varies based on withdrawal method, as displayed at time of transaction.</li>
              <li>Currency conversion fee: 1.5% for transactions involving currency exchange.</li>
            </ul>
            <p className="mt-2">All fees are subject to change. Users will be notified of any fee changes at least 30 days in advance.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">7. Prohibited Activities</h2>
            <p className="mb-2">The following activities are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing false or misleading information.</li>
              <li>Using the Platform for illegal purposes or to promote illegal activities.</li>
              <li>Attempting to manipulate or game the investment system.</li>
              <li>Creating multiple accounts to circumvent limits or restrictions.</li>
              <li>Using automated systems or bots to access the Platform without our express permission.</li>
              <li>Engaging in money laundering or financing terrorism.</li>
              <li>Violating the intellectual property rights of Axiomify or third parties.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">8. Termination of Service</h2>
            <p>Axiomify reserves the right to terminate or suspend your account and access to the Platform at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Axiomify and its officers, directors, employees, and agents exclude all liability for any loss or damage arising from your use of the Platform, including but not limited to loss of data, profits, or business interruption.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
            <p>We may revise these Terms at any time by amending this page. You are expected to check this page from time to time to take notice of any changes we make, as they are legally binding on you upon your continued use of the Platform.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts of [Jurisdiction].</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">12. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="mt-2">
              Axiomify, Inc.<br />
              Email: legal@axiomify.com<br />
              Address: 123 Finance Street, Investment City, IN 12345
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

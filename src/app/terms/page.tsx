
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  return (
    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8 md:py-12 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
            <FileText className="mr-3 h-10 w-10 text-accent" />
            Terms & <span className="text-accent">Conditions</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using Our Service. Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6 text-muted-foreground text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FinSight AI (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Service's particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this Service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">2. Description of Service</h2>
              <p>
                FinSight AI provides artificial intelligence-based analysis of financial market data, including candlestick charts, for educational and informational purposes only. The Service is not intended to provide financial, investment, or trading advice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">3. User Accounts and Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password. You must be at least 18 years of age to use this Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">4. Subscription, Billing, and Cancellation</h2>
              <p>
                <strong>Billing:</strong> We offer both free trial and paid subscription plans. By selecting a paid plan, you agree to pay the subscription fees at the rates in effect when the charges were incurred. All fees are non-refundable.
              </p>
              <p className="mt-2">
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation will be effective at the end of the current billing cycle. You will continue to have access to the Service until the end of your billing period.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">5. Intellectual Property</h2>
              <p>
                The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of FinSight AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FinSight AI.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">6. User-Generated Content</h2>
              <p>
                You retain ownership of any content you submit to the Service, such as uploaded chart images. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, process, and display such content solely for the purpose of operating, providing, and improving the Service. We will not use your content for any other purpose without your explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">7. Prohibited Activities</h2>
              <p>
                You are expressly prohibited from: (a) using the Service for any illegal purpose or in violation of any local, state, national, or international law; (b) reverse-engineering, decompiling, or attempting to discover the source code of the Service; (c) transmitting any viruses, worms, defects, Trojan horses, or other items of a destructive nature; (d) interfering with the proper working of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. FINANICAL MARKETS ARE SUBJECT TO HIGH VOLATILITY AND RISK. THE AI-GENERATED ANALYSIS, PREDICTIONS, AND ALL OTHER CONTENT ARE FOR INFORMATIONAL PURPOSES ONLY AND SHOULD NOT BE CONSTRUED AS FINANCIAL ADVICE. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY INFORMATION ON THE SERVICE AND NEITHER ADOPT NOR ENDORSE, NOR ARE WE RESPONSIBLE FOR, THE ACCURACY OR RELIABILITY OF ANY OPINION, ADVICE, OR STATEMENT MADE.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">9. Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL FINSIGHT AI, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">10. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is established, without regard to its conflict of law provisions.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">11. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">12. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us via the <Link href="/contact" className="text-primary hover:underline">contact page</Link>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

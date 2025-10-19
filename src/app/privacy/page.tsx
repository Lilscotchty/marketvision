
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8 md:py-12 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
            <ShieldCheck className="mr-3 h-10 w-10 text-accent" />
            Privacy <span className="text-accent">Policy</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">1. Introduction</h2>
              <p>
                Welcome to FinSight AI. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">2. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services or otherwise when you contact us.
              </p>
              <p className="mt-2">
                The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following: email address, username, password, and payment information.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">3. How We Use Your Information</h2>
              <p>
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">4. Will Your Information Be Shared?</h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, Legal Obligations.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-foreground mb-2">5. Use of Cookies and Other Tracking Technologies</h2>
              <p>
                We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">6. How We Keep Your Information Safe</h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-2">7. Policy for Minors</h2>
              <p>
                We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-foreground mb-2">8. Contact Us</h2>
              <p>
                If you have questions or comments about this policy, you may email us at privacy@finsightai.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

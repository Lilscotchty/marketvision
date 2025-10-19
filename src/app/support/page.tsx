
import { LifeBuoy, BookOpen, MessageSquare, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const faqs = [
  {
    question: 'How does the AI chart analysis work?',
    answer: "Our AI is trained on millions of historical chart patterns and ICT concepts. When you upload an image, it performs a multi-layered analysis to identify trends, patterns, and key levels, then generates a prediction based on its findings.",
  },
  {
    question: 'What are "Trial Points"?',
    answer: 'New users receive free trial points to test our chart analysis tool. Each analysis consumes one point. You can get unlimited analyses by subscribing to our Pro plan.',
  },
  {
    question: 'Is the analysis financial advice?',
    answer: 'No. All analyses and predictions provided by FinSight AI are for educational and informational purposes only. They are not financial advice. Please do your own research and consult with a qualified financial advisor before making any investment decisions.',
  },
    {
    question: 'How do I set up a price alert?',
    answer: 'Navigate to the "Alerts" page, fill in the details for your alert such as the asset, target price, and notification method, then click "Add Alert". Make sure the alert is activated to receive notifications.',
  },
  {
    question: 'Which assets are supported for analysis?',
    answer: 'Our AI can analyze any candlestick chart image for any asset, including stocks, forex, and cryptocurrencies. For live data fetching, we support a wide range of assets via our data provider.',
  },
];

export default function SupportPage() {
  return (
    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8 md:py-12 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
            <LifeBuoy className="mr-3 h-10 w-10 text-accent" />
            Support <span className="text-accent">Center</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to your questions and get help with our platform.
          </p>
        </header>

        <section id="support-options" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentation</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Read the Guides</div>
              <p className="text-xs text-muted-foreground">
                In-depth articles on features and strategies.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Forum</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ask the Community</div>
              <p className="text-xs text-muted-foreground">
                Get help from other users and experts. (Coming Soon)
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Video Tutorials</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Watch & Learn</div>
              <p className="text-xs text-muted-foreground">
                Visual guides to get the most out of FinSight.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="faq">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

         <section className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Still need help?</h2>
            <p className="text-muted-foreground mt-2 mb-4">Our team is ready to assist you.</p>
            <Link href="/contact">
                <Button>Contact Support</Button>
            </Link>
        </section>
      </div>
    </main>
  );
}

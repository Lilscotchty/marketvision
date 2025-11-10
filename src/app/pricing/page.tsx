
import { PriceCard, OfferingWrapper, Offering, ProductName, Price, Description } from '@/components/pricing/pricing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {  Star } from 'lucide-react';
import SubscribeButton from '@/components/pricing/subscribe-button';

export default function PricingPage() {
  return (
    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8 md:py-12 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl">
            Pricing <span className="text-accent">Plans</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Choose the plan that fits your trading style and goals.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-center">
          {/* Basic Plan */}
          <PriceCard>
            <ProductName>Basic</ProductName>
            <Description>
              For casual traders and beginners looking to get started with AI analysis.
            </Description>
            <Price period="/ month">$19</Price>
            <Button variant="outline" className="w-full">Get Started</Button>
            <OfferingWrapper>
              <Offering>50 chart analyses per month</Offering>
              <Offering>Basic ICT pattern recognition</Offering>
              <Offering>Standard market predictions</Offering>
              <Offering>Email support</Offering>
            </OfferingWrapper>
          </PriceCard>

          {/* Pro Plan - Featured */}
          <PriceCard isFeatured={true}>
            <div className="flex justify-between items-center">
              <ProductName>Pro</ProductName>
              <Badge variant="default" className="bg-primary hover:bg-primary">
                <Star className="mr-1 h-3 w-3" /> Most Popular
              </Badge>
            </div>
            <Description>
              For active traders who need advanced tools and multi-timeframe analysis.
            </Description>
            <Price period="/ month">$49</Price>
            <SubscribeButton />
            <OfferingWrapper>
              <Offering>500 chart analyses per month</Offering>
              <Offering>Advanced ICT concepts (Breaker Blocks, FVGs)</Offering>
              <Offering>Multi-timeframe analysis</Offering>
              <Offering>Real-time price alerts</Offering>
              <Offering>Conceptual trade setups</Offering>
              <Offering>Priority email support</Offering>
            </OfferingWrapper>
          </PriceCard>

          {/* Enterprise Plan */}
          <PriceCard contactPageHref="/contact">
            <ProductName>Enterprise</ProductName>
            <Description>
              For professional traders, teams, and institutions requiring unlimited access and support.
            </Description>
            <Price>Custom</Price>
            <OfferingWrapper>
              <Offering>Unlimited chart analyses</Offering>
              <Offering>All Pro features</Offering>
              <Offering>API access (coming soon)</Offering>
              <Offering>Team management features</Offering>
              <Offering>Dedicated account manager</Offering>
              <Offering>24/7 priority support</Offering>
            </OfferingWrapper>
          </PriceCard>
        </section>
      </div>
    </main>
  );
}

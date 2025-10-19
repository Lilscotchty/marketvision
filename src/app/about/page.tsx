
import { Info, Users, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const teamMembers = [
  {
    name: 'Alex Johnson',
    role: 'Lead AI Engineer',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    bio: 'Alex leads the development of our predictive models, with a background in quantitative finance and machine learning.',
  },
  {
    name: 'Samantha Lee',
    role: 'Head of Product',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    bio: 'Samantha ensures our tools are intuitive and powerful, bridging the gap between complex data and user-friendly design.',
  },
  {
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    bio: 'Michael oversees the entire tech stack, ensuring scalability, security, and performance of the FinSight platform.',
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-24 md:pb-8">
      <div className="container mx-auto py-8 md:py-12 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl flex items-center justify-center">
            <Info className="mr-3 h-10 w-10 text-accent" />
            About <span className="text-accent">FinSight AI</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Leveraging cutting-edge AI to provide traders with unparalleled market intelligence and predictive analytics.
          </p>
        </header>

        <section id="our-mission">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Bot className="text-primary" /> Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                At FinSight AI, our mission is to democratize access to institutional-grade trading tools. We believe that the power of artificial intelligence can level the playing field, enabling individual traders to make more informed decisions with confidence.
              </p>
              <p>
                We are committed to building a platform that is not only powerful but also intuitive and educational. By translating complex market structures and AI predictions into clear, actionable insights, we empower our users to navigate the financial markets more effectively.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="our-team">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">
            Meet the <span className="text-accent">Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary font-medium">{member.role}</p>
                  <p className="text-xs text-muted-foreground mt-2">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

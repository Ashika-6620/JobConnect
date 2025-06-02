import Footer from "@/components/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, BarChart, Briefcase, FileText, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-fit">
                    The Future of Job Search
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find Your Dream Job with Job Connect
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Job Connect connects talented professionals with
                    forward-thinking companies using advanced 
                    interactive tools.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full min-[400px]:w-auto"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src="/job-hero.jpg"
                    alt="Job Connect Platform Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit mx-auto">
                  Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything You Need to Land Your Dream Job
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                  Our platform combines cutting-edge AI with practical tools to
                  make your job search more effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">
                    Interactive Resume Builder
                  </h3>
                  <p className="text-muted-foreground">
                    Create ATS-friendly resumes with our intuitive builder that
                    highlights your strengths.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI Job Recommendations</h3>
                  <p className="text-muted-foreground">
                    Get personalized job matches based on your skills,
                    experience, and preferences.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <h3 className="text-xl font-bold">Resume View Tracking</h3>
                  <p className="text-muted-foreground">
                    Receive notifications when employers view your resume and
                    track application status.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Skill Challenges</h3>
                  <p className="text-muted-foreground">
                    Complete puzzles and challenges to showcase your skills and
                    stand out to employers.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Leaderboard</h3>
                  <p className="text-muted-foreground">
                    Compete with other job seekers and earn recognition for your
                    achievements.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Employer Dashboard</h3>
                  <p className="text-muted-foreground">
                    Powerful tools for employers to find, evaluate, and connect
                    with top talent.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  How It Works
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                  Our platform makes job searching and hiring simple and
                  effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Sign up and build your professional profile with our
                  interactive resume builder.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Discover Opportunities</h3>
                <p className="text-muted-foreground">
                  Browse AI-recommended jobs or search for specific positions
                  that match your skills.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Apply & Track</h3>
                <p className="text-muted-foreground">
                  Submit applications with ATS-friendly resumes and track your
                  progress in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="w-full py-12 md:py-24 bg-muted/30"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit mx-auto">
                  Testimonials
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  What Our Users Say
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                  Hear from job seekers and employers who have found success
                  with Job Connect.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-full overflow-hidden w-12 h-12 bg-muted">
                      <img
                        src="/placeholder.svg?height=50&width=50"
                        alt="User Avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">
                        Software Engineer
                      </p>
                    </div>
                  </div>
                  <p className="italic">
                    "The AI job recommendations were spot on! I found a position
                    that perfectly matched my skills and interests, and the
                    resume tracking feature kept me informed throughout the
                    process."
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-full overflow-hidden w-12 h-12 bg-muted">
                      <img
                        src="/placeholder.svg?height=50&width=50"
                        alt="User Avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Michael Chen</h4>
                      <p className="text-sm text-muted-foreground">
                        HR Director
                      </p>
                    </div>
                  </div>
                  <p className="italic">
                    "As an employer, Job Connect has transformed our hiring
                    process. The quality of candidates we've found through the
                    platform is exceptional, and the dashboard makes managing
                    applications a breeze."
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-full overflow-hidden w-12 h-12 bg-muted">
                      <img
                        src="/placeholder.svg?height=50&width=50"
                        alt="User Avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Emily Rodriguez</h4>
                      <p className="text-sm text-muted-foreground">
                        Marketing Specialist
                      </p>
                    </div>
                  </div>
                  <p className="italic">
                    "The resume builder helped me create a professional,
                    ATS-friendly resume that got noticed. I received
                    notifications when employers viewed my profile, which gave
                    me valuable insights into my job search."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit mx-auto">
                  FAQ
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                  Find answers to common questions about Job Connect.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-bold">
                    How does AI job matching work?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Our AI analyzes your skills, experience, and preferences
                      to match you with relevant job opportunities. The more you
                      use the platform, the better the recommendations become.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-bold">
                    What makes a resume ATS-friendly?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      ATS-friendly resumes use standard formatting, relevant
                      keywords, and clear sections that can be easily parsed by
                      Applicant Tracking Systems. Our resume builder
                      automatically optimizes your resume for ATS compatibility.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-bold">
                    How do skill challenges improve my chances?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Completing skill challenges demonstrates your abilities to
                      potential employers and improves your ranking in search
                      results. Employers can see your challenge scores and
                      achievements, giving you an edge over other candidates.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-bold">
                    Can I use Job Connect on mobile devices?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Yes, Job Connect is fully responsive and works on all
                      devices, including smartphones and tablets. You can search
                      for jobs, update your profile, and receive notifications
                      on the go.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

"use client";

import { MessageSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "neelam-ui";

const questions = [
  {
    id: "trial",
    question: "What happens when the trial ends?",
    answer:
      "Nothing is deleted and nothing renews on its own. The workspace drops to the Starter limits until someone on the team picks a plan, and everything above those limits becomes read-only rather than disappearing.",
  },
  {
    id: "seats",
    question: "How are seats counted?",
    answer:
      "A seat is anyone who can change something. Viewers are free and unlimited. Seats added mid-cycle are prorated to the days remaining, and removing one credits the next invoice.",
  },
  {
    id: "data",
    question: "Can I export my data?",
    answer:
      "Yes, on every plan including the free one. Projects, activity history, and comments export as JSON or CSV from the workspace settings, and the same export is available through the API.",
  },
  {
    id: "sso",
    question: "Do you support SSO and SCIM?",
    answer:
      "SAML single sign-on is on the Team plan, with SCIM provisioning for Okta, Entra ID, and Google Workspace. Enforcing SSO for a domain is a switch in the security settings.",
  },
  {
    id: "support",
    question: "What does support actually cover?",
    answer:
      "Starter has community support, Pro has email support with a one-business-day target, and Team adds a shared channel with the engineers who build the product.",
  },
];

export default function Faq01() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <section>
          <Badge variant="secondary">Support</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Everything teams ask before they roll Northstar out. If yours
            isn&apos;t here, the answer is one message away.
          </p>

          {/* Single-open by default: one answer at a time keeps the list
              readable. Pass type="multiple" if a reader should be able to
              compare two answers side by side. */}
          <Accordion defaultValue="trial" className="mt-8">
            {questions.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionHeader>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <aside className="lg:pt-16">
          <Card>
            <CardHeader>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </span>
              <CardTitle className="mt-4">Still deciding?</CardTitle>
              <CardDescription>
                Talk to someone who has migrated a team your size. Median reply
                time is under two hours.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3">
                <AvatarGroup label="Support engineers" max={3} total={9}>
                  <Avatar size="sm">
                    <AvatarImage src="https://i.pravatar.cc/128?img=47" alt="" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>GH</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>KJ</AvatarFallback>
                  </Avatar>
                </AvatarGroup>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nine engineers on support rota.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex-col items-stretch gap-2">
              <Button className="w-full">Start a conversation</Button>
              <Button variant="ghost" className="w-full">
                Read the docs
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}

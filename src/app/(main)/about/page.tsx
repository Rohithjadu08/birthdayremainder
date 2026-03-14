'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, GraduationCap, Sparkles } from "lucide-react";

const creators = [
  {
    role: 'Built by',
    name: 'Rohith P',
    initial: 'RP',
  },
  {
    role: 'Co-founder',
    name: 'Rahul Kumar Yadav',
    initial: 'RY',
  },
  {
    role: 'Co-founder',
    name: 'Sujan Khatri',
    initial: 'SK',
  },
  {
    role: 'Co-founder',
    name: 'Samagya Baral',
    initial: 'SB',
  },
];

export default function AboutPage() {
    return (
        <div className="grid gap-6 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary h-6 w-6" />
                        Our Mission
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground">
                        This application is designed to help professors and teachers build stronger connections with their students by never missing a birthday. It provides timely reminders, creative wishing assistance through our AI, Agentverse, and a centralized place to manage student information, fostering a more supportive and personal learning environment.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>About The Creators</CardTitle>
                    <CardDescription>
                        This application was proudly developed by ZAYA GROUP OF COMPANY, with a team of passionate students from Sona College of Technology.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    {creators.map((creator) => (
                        <div key={creator.name} className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 text-lg">
                                <AvatarFallback>{creator.initial}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="text-xl font-semibold text-card-foreground">
                                    {creator.name}
                                </p>
                                <p className="text-md font-medium text-primary">{creator.role}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>B.E - CSE(AIML)</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building className="h-4 w-4" />
                                    <span>Sona College of Technology</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

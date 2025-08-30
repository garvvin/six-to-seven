import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Github,
  Linkedin,
  Mail,
  Users,
  Trophy,
  Code,
  Heart,
} from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Team Member 1',
      role: 'Full Stack Developer',
      avatar: '👨‍💻',
      bio: 'Passionate about creating innovative health solutions and building scalable applications.',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      github: '#',
      linkedin: '#',
      email: 'member1@healthsync.com',
    },
    {
      name: 'Team Member 2',
      role: 'Frontend Developer',
      avatar: '👩‍💻',
      bio: 'Focused on creating beautiful, accessible, and user-friendly interfaces.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'UI/UX'],
      github: '#',
      linkedin: '#',
      email: 'member2@healthsync.com',
    },
    {
      name: 'Team Member 3',
      role: 'Backend Developer',
      avatar: '👨‍💻',
      bio: 'Expert in building robust APIs and database systems for health applications.',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      github: '#',
      linkedin: '#',
      email: 'member3@healthsync.com',
    },
    {
      name: 'Team Member 4',
      role: 'Data Scientist',
      avatar: '👩‍🔬',
      bio: 'Specialized in health data analysis and machine learning algorithms.',
      skills: ['Python', 'TensorFlow', 'Pandas', 'ML'],
      github: '#',
      linkedin: '#',
      email: 'member4@healthsync.com',
    },
  ];

  const projectInfo = [
    {
      icon: Trophy,
      title: 'Hackathon Project',
      description:
        'HealthSync was built during a 48-hour hackathon, demonstrating rapid prototyping and innovation.',
    },
    {
      icon: Code,
      title: 'Modern Tech Stack',
      description:
        'Built with React, Vite, Tailwind CSS, and modern web technologies for optimal performance.',
    },
    {
      icon: Heart,
      title: 'Health Focused',
      description:
        'Dedicated to improving health outcomes through better data tracking and collaboration.',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="text-center mb-16" aria-labelledby="team-header">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 rounded-full">
              <Users
                className="h-12 w-12 text-primary-600"
                aria-hidden="true"
              />
            </div>
          </div>
          <h1
            id="team-header"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're a passionate team of developers, designers, and innovators who
            came together during a hackathon to build HealthSync - a
            comprehensive health tracking solution.
          </p>
        </section>

        {/* Project Info */}
        <section className="mb-16" aria-labelledby="project-info-heading">
          <h2 id="project-info-heading" className="sr-only">
            Project Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {projectInfo.map((info, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-medium transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <info.icon
                        className="h-8 w-8 text-primary-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {info.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Members */}
        <section className="mb-16" aria-labelledby="team-members-heading">
          <h2
            id="team-members-heading"
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-medium transition-shadow duration-300"
              >
                <CardHeader>
                  <div
                    className="text-6xl mb-4"
                    role="img"
                    aria-label={`${member.name}'s avatar`}
                  >
                    {member.avatar}
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-primary-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{member.bio}</p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-center space-x-3 pt-2">
                    <a
                      href={member.github}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`${member.name}'s GitHub profile`}
                    >
                      <Github className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <a
                      href={member.linkedin}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`${member.name}'s LinkedIn profile`}
                    >
                      <Linkedin className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section aria-labelledby="cta-heading">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle id="cta-heading" className="text-3xl text-white">
                Join Our Mission
              </CardTitle>
              <CardDescription className="text-primary-100 text-lg">
                We're always looking for passionate developers and designers to
                join our team
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-100 mb-4">
                Interested in contributing to HealthSync or want to learn more
                about our project?
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  asChild
                  size="lg"
                  variant="default"
                  className="px-6 py-3"
                >
                  <a href="mailto:team@healthsync.com">
                    <Mail className="h-5 w-5 mr-2" aria-hidden="true" />
                    Contact Us
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Team;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Video,
} from "lucide-react";

export default function Home() {
  const contactInfo = [
    {
      icon: MapPin,
      label: "Address",
      value: "1900, Connecticut Ave NW, Washington, DC 20009, United States",
      link: "https://maps.google.com/?q=1900+Connecticut+Ave+NW+Washington+DC+20009",
    },
    {
      icon: Mail,
      label: "Email",
      value: "axiomifyllm@gmail.com",
      link: "mailto:axiomifyllm@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (646) 351-0973",
      link: "tel:+16463510973",
    },
    {
      icon: MessageCircle,
      label: "Telegram",
      value: "t.me/Axiomify",
      link: "https://t.me/Axiomify",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@enterpramoxify",
      link: "https://www.instagram.com/enterpramoxify/profilecard/?igsh=OTl6OXNxOHRmOXlq",
    },
    {
      icon: Facebook,
      label: "Facebook",
      value: "Axiomify",
      link: "https://www.facebook.com/share/1N9zZBz5Tp/",
    },
    {
      icon: Video,
      label: "TikTok",
      value: "@amoxify.enterpr",
      link: "https://www.tiktok.com/@amoxify.enterpr?_t=ZM-8wlE0l5CrxA&_r=1",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-yellow-400">Axiomify</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Your trusted platform for P2P lending, video rewards, and digital investments.
        </p>
        <Button
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          Get Started
        </Button>
      </section>

      {/* Support Section */}
      <section className="py-16 px-6 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Support & <span className="text-yellow-400">Contact</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((info) => (
              <Card
                key={info.label}
                className="bg-[#1C1C1C] border-[#333333] p-6 hover:border-yellow-400/50 transition-colors"
              >
                <a
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 text-white hover:text-yellow-400 transition-colors"
                >
                  <info.icon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">{info.label}</h3>
                    <p className="text-gray-400">{info.value}</p>
                  </div>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-black/60 border-t border-[#333333]">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>© {new Date().getFullYear()} Axiomify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 
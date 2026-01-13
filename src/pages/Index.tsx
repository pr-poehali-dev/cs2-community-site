import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  const handleSteamLogin = () => {
    const returnUrl = encodeURIComponent(window.location.origin);
    window.location.href = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${returnUrl}/auth/steam/callback&openid.realm=${returnUrl}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
  };

  const privileges = [
    {
      name: "Low",
      tier: 1,
      color: "from-purple-500 to-purple-700",
      glowColor: "shadow-[0_0_30px_rgba(168,85,247,0.4)]",
      prices: [
        { duration: "2 недели", price: "20₽" },
        { duration: "Навсегда", price: "100₽" }
      ],
      features: [
        { icon: "Zap", text: "Баннихоп" },
        { icon: "Syringe", text: "1 шприц" },
        { icon: "Tag", text: "Тег 'Low'" },
        { icon: "Palette", text: "Доступ к патерну" },
        { icon: "Sparkles", text: "Доступ к флоат в скинченжере" }
      ]
    },
    {
      name: "Nice",
      tier: 2,
      color: "from-blue-500 to-purple-600",
      glowColor: "shadow-[0_0_40px_rgba(59,130,246,0.5)]",
      popular: true,
      prices: [
        { duration: "Месяц", price: "100₽" },
        { duration: "Навсегда", price: "300₽" }
      ],
      features: [
        { icon: "Check", text: "Все из Low" },
        { icon: "ArrowUpCircle", text: "Двойной прыжок на всех серверах" },
        { icon: "Syringe", text: "2 шприца вместо 1" },
        { icon: "Gauge", text: "Ускоренный баннихоп" },
        { icon: "Paintbrush", text: "Доступ к Paint" }
      ]
    },
    {
      name: "Escape",
      tier: 3,
      color: "from-purple-600 via-pink-500 to-blue-500",
      glowColor: "shadow-[0_0_50px_rgba(168,85,247,0.6)]",
      prices: [
        { duration: "Месяц", price: "200₽" },
        { duration: "Навсегда", price: "550₽" }
      ],
      features: [
        { icon: "Check", text: "Все из Low + Nice" },
        { icon: "Syringe", text: "3 шприца" },
        { icon: "MoveUp", text: "3 прыжка" },
        { icon: "Rocket", text: "Максимальная скорость баннихоп" },
        { icon: "Star", text: "Доступ к артефактам (ускорение, доп прыжок, гравитация и многое другое)" }
      ]
    }
  ];

  const faqItems = [
    {
      question: "Как приобрести привилегию?",
      answer: "Выберите нужную привилегию, нажмите 'Купить сейчас' или 'Купить навсегда', переведите средства по указанным реквизитам и напишите в Telegram @cs2hueta с подтверждением оплаты."
    },
    {
      question: "Когда активируется привилегия после оплаты?",
      answer: "Привилегия активируется в течение 5-30 минут после подтверждения оплаты администратором."
    },
    {
      question: "Можно ли вернуть деньги?",
      answer: "Возврат средств возможен только в случае технической ошибки со стороны сервера до активации привилегии."
    },
    {
      question: "Работают ли привилегии на всех серверах?",
      answer: "Да, все привилегии работают на всех наших серверах CS2."
    },
    {
      question: "Что такое артефакты в Escape?",
      answer: "Артефакты - это специальные способности: ускорение, дополнительный прыжок, изменение гравитации и другие уникальные бонусы."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-black/30 border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-orbitron font-bold glow-purple bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              WINNER.TO
            </h1>
            <div className="hidden md:flex gap-6">
              {["home", "servers", "privileges", "donate", "contacts", "faq"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`font-inter font-medium transition-all hover:text-purple-400 ${
                    activeSection === section ? "text-purple-400" : "text-gray-300"
                  }`}
                >
                  {section === "home" && "Главная"}
                  {section === "servers" && "Серверы"}
                  {section === "privileges" && "Привилегии"}
                  {section === "donate" && "Донат"}
                  {section === "contacts" && "Контакты"}
                  {section === "faq" && "FAQ"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSteamLogin}
                className="hidden md:flex bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-orbitron font-semibold"
              >
                <Icon name="LogIn" className="mr-2" size={18} />
                Войти через Steam
              </Button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-purple-400">
                    <Icon name="Menu" size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gradient-to-b from-[#0a0a0f] to-[#0f0f1a] border-purple-500/20">
                  <div className="flex flex-col gap-6 mt-8">
                    {["home", "servers", "privileges", "donate", "contacts", "faq"].map((section) => (
                      <button
                        key={section}
                        onClick={() => scrollToSection(section)}
                        className={`font-inter font-medium text-left transition-all hover:text-purple-400 text-lg ${
                          activeSection === section ? "text-purple-400" : "text-gray-300"
                        }`}
                      >
                        {section === "home" && "Главная"}
                        {section === "servers" && "Серверы"}
                        {section === "privileges" && "Привилегии"}
                        {section === "donate" && "Донат"}
                        {section === "contacts" && "Контакты"}
                        {section === "faq" && "FAQ"}
                      </button>
                    ))}
                    <Button
                      onClick={handleSteamLogin}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-orbitron font-semibold w-full"
                    >
                      <Icon name="LogIn" className="mr-2" size={18} />
                      Войти через Steam
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center animate-fade-in">
          <h2 className="text-6xl md:text-8xl font-orbitron font-black mb-6 glow-purple bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            WINNER.TO
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-inter max-w-3xl mx-auto">
            Лучшие серверы CS2 с уникальными возможностями. Прокачай свой геймплей до максимума!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => scrollToSection("privileges")}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-orbitron font-bold px-8 py-6 card-glow"
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Привилегии
            </Button>
            <Button
              onClick={() => scrollToSection("servers")}
              size="lg"
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg font-orbitron font-bold px-8 py-6"
            >
              <Icon name="Server" className="mr-2" size={20} />
              Наши серверы
            </Button>
          </div>
        </div>
      </section>

      <section id="servers" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-5xl font-orbitron font-bold text-center mb-12 glow-purple">Наши серверы</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Surf Server", players: "24/32", ip: "connect 185.xxx.xxx.xxx:27015" },
              { name: "Bhop Server", players: "18/32", ip: "connect 185.xxx.xxx.xxx:27016" },
              { name: "KZ Server", players: "12/32", ip: "connect 185.xxx.xxx.xxx:27017" }
            ].map((server, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-500/30 card-glow hover:scale-105 transition-transform">
                <CardHeader>
                  <CardTitle className="font-orbitron text-purple-300 flex items-center gap-2">
                    <Icon name="Server" size={24} />
                    {server.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 font-inter">{server.ip}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-green-400 font-inter">
                    <Icon name="Users" size={18} />
                    <span>{server.players} онлайн</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="privileges" className="py-20 px-4 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="container mx-auto">
          <h2 className="text-5xl font-orbitron font-bold text-center mb-4 glow-purple">Привилегии</h2>
          <p className="text-center text-gray-400 mb-12 font-inter">Выбери свой уровень и получи преимущества</p>
          <div className="grid md:grid-cols-3 gap-8">
            {privileges.map((priv, idx) => (
              <Card
                key={idx}
                className={`bg-gradient-to-br ${priv.color} bg-opacity-10 border-2 border-purple-500/40 ${priv.glowColor} hover:scale-105 transition-all relative overflow-hidden`}
              >
                {priv.popular && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 font-orbitron">
                    ПОПУЛЯРНО
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-4xl font-orbitron font-black text-center mb-2">{priv.name}</CardTitle>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {priv.prices.map((price, pidx) => (
                      <div key={pidx} className="text-center">
                        <p className="text-sm text-gray-400 font-inter">{price.duration}</p>
                        <p className="text-2xl font-bold text-purple-300 font-orbitron">{price.price}</p>
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {priv.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <Icon name={feature.icon} className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                      <span className="font-inter text-gray-200">{feature.text}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    onClick={() => scrollToSection("donate")}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-orbitron font-bold"
                  >
                    Купить сейчас
                  </Button>
                  <Button
                    onClick={() => scrollToSection("donate")}
                    variant="outline"
                    className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/10 font-orbitron"
                  >
                    Купить навсегда
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="donate" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-5xl font-orbitron font-bold text-center mb-4 glow-blue">Оплата</h2>
          <p className="text-center text-gray-400 mb-12 font-inter">Следуйте инструкциям для активации привилегии</p>
          
          <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/30 card-glow-blue mb-8">
            <CardHeader>
              <CardTitle className="font-orbitron text-blue-300 flex items-center gap-2">
                <Icon name="CreditCard" size={24} />
                Реквизиты для оплаты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                <p className="text-sm text-gray-400 mb-1 font-inter">Тинькофф (МИР)</p>
                <p className="text-xl font-mono font-bold text-blue-300">2200 7020 0981 5999</p>
                <p className="text-sm text-gray-400 mt-1 font-inter">Получатель: Н.Ч</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-500/30 card-glow">
            <CardHeader>
              <CardTitle className="font-orbitron text-purple-300 flex items-center gap-2">
                <Icon name="ListOrdered" size={24} />
                Инструкция по оплате
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 font-inter">
                {[
                  "Выберите нужную привилегию выше",
                  "Переведите указанную сумму по реквизитам",
                  "Напишите в Telegram @cs2hueta с подтверждением оплаты и вашим Steam ID",
                  "Дождитесь активации (5-30 минут)",
                  "Готово! Наслаждайтесь привилегиями на серверах"
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-200 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="contacts" className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-5xl font-orbitron font-bold text-center mb-12 glow-blue">Контакты</h2>
          <div className="grid gap-6">
            <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/30 card-glow-blue hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="font-orbitron text-blue-300 flex items-center gap-3">
                  <Icon name="Send" size={24} />
                  Telegram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => window.open("https://t.me/cs2hueta", "_blank")}
                  variant="outline"
                  className="w-full border-blue-400/50 text-blue-300 hover:bg-blue-500/10 font-inter"
                >
                  Написать @cs2hueta
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-500/30 card-glow hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="font-orbitron text-purple-300 flex items-center gap-3">
                  <Icon name="MessageCircle" size={24} />
                  Discord сервер
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => window.open("https://discord.gg/arPR2fpi", "_blank")}
                  variant="outline"
                  className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-500/10 font-inter"
                >
                  Присоединиться к Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-5xl font-orbitron font-bold text-center mb-12 glow-purple">FAQ</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border border-purple-500/30 rounded-lg px-6 card-glow"
              >
                <AccordionTrigger className="font-orbitron text-purple-300 hover:text-purple-200 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="font-inter text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-purple-500/20 bg-black/30">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 font-inter">
            © 2024 WINNER.TO - Все права защищены
          </p>
          <p className="text-gray-500 text-sm mt-2 font-inter">
            Лучшие CS2 серверы с уникальными привилегиями
          </p>
        </div>
      </footer>
    </div>
  );
}
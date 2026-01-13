import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { API_URLS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface PurchaseRequest {
  id: number;
  privilege_type: string;
  duration_type: string;
  price: number;
  payment_proof: string;
  created_at: string;
  user: {
    steam_id: string;
    steam_name: string;
    steam_avatar: string;
  };
}

interface User {
  id: number;
  steam_id: string;
  steam_name: string;
  steam_avatar: string;
  created_at: string;
  privilege_count: number;
}

export default function Admin() {
  const [adminSteamId, setAdminSteamId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSteamId = localStorage.getItem("admin_steam_id");
    if (storedSteamId) {
      setAdminSteamId(storedSteamId);
      setIsAuthenticated(true);
      loadData(storedSteamId);
    }
  }, []);

  const handleLogin = () => {
    if (adminSteamId.trim()) {
      localStorage.setItem("admin_steam_id", adminSteamId);
      setIsAuthenticated(true);
      loadData(adminSteamId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_steam_id");
    setIsAuthenticated(false);
    setAdminSteamId("");
  };

  const loadData = async (steamId: string) => {
    setLoading(true);
    await Promise.all([loadRequests(steamId), loadUsers(steamId)]);
    setLoading(false);
  };

  const loadRequests = async (steamId: string) => {
    try {
      const response = await fetch(`${API_URLS.admin}/requests`, {
        headers: {
          "X-Admin-Steam-Id": steamId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.error || "Не удалось загрузить заявки",
        });
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const loadUsers = async (steamId: string) => {
    try {
      const response = await fetch(`${API_URLS.admin}/users`, {
        headers: {
          "X-Admin-Steam-Id": steamId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      const response = await fetch(`${API_URLS.admin}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Steam-Id": adminSteamId,
        },
        body: JSON.stringify({ request_id: requestId }),
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Привилегия активирована",
        });
        loadData(adminSteamId);
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось активировать привилегию",
      });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const response = await fetch(`${API_URLS.admin}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Steam-Id": adminSteamId,
        },
        body: JSON.stringify({ request_id: requestId }),
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Заявка отклонена",
        });
        loadData(adminSteamId);
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отклонить заявку",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-500/30 card-glow">
          <CardHeader>
            <CardTitle className="text-3xl font-orbitron text-center glow-purple">Админ-панель</CardTitle>
            <CardDescription className="text-center font-inter">
              Введите ваш Steam ID для входа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Steam ID (например: 76561198000000000)"
              value={adminSteamId}
              onChange={(e) => setAdminSteamId(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white font-inter focus:outline-none focus:border-purple-500"
            />
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-orbitron font-bold"
            >
              <Icon name="LogIn" className="mr-2" size={18} />
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <nav className="border-b border-purple-500/20 bg-black/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-2xl font-orbitron font-bold glow-purple bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                WINNER.TO
              </a>
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 font-orbitron">ADMIN</Badge>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-orbitron"
            >
              <Icon name="LogOut" className="mr-2" size={18} />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-purple-950/30 border border-purple-500/30">
            <TabsTrigger value="requests" className="font-orbitron">
              <Icon name="ShoppingCart" className="mr-2" size={18} />
              Заявки на покупку
              {requests.length > 0 && (
                <Badge className="ml-2 bg-red-500">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="font-orbitron">
              <Icon name="Users" className="mr-2" size={18} />
              Пользователи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-500/30 card-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-purple-300">Заявки на активацию привилегий</CardTitle>
                <CardDescription className="font-inter">
                  Проверьте подтверждение оплаты и активируйте привилегии
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-400 font-inter">Загрузка...</div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-inter">Нет новых заявок</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/20">
                        <TableHead className="font-orbitron text-purple-300">Игрок</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Привилегия</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Срок</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Цена</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Дата</TableHead>
                        <TableHead className="font-orbitron text-purple-300 text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow key={req.id} className="border-purple-500/20">
                          <TableCell className="font-inter">
                            <div className="flex items-center gap-3">
                              {req.user.steam_avatar && (
                                <img src={req.user.steam_avatar} alt="" className="w-10 h-10 rounded-full" />
                              )}
                              <div>
                                <div className="font-medium text-white">{req.user.steam_name}</div>
                                <div className="text-xs text-gray-400">{req.user.steam_id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 font-orbitron">
                              {req.privilege_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-inter text-gray-300">
                            {req.duration_type === '2weeks' && '2 недели'}
                            {req.duration_type === '1month' && '1 месяц'}
                            {req.duration_type === 'forever' && 'Навсегда'}
                          </TableCell>
                          <TableCell className="font-orbitron text-purple-300">{req.price}₽</TableCell>
                          <TableCell className="font-inter text-gray-400 text-sm">
                            {new Date(req.created_at).toLocaleString('ru')}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              onClick={() => handleApprove(req.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 font-orbitron"
                            >
                              <Icon name="Check" size={16} />
                            </Button>
                            <Button
                              onClick={() => handleReject(req.id)}
                              size="sm"
                              variant="destructive"
                              className="font-orbitron"
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gradient-to-br from-purple-950/30 to-blue-950/30 border-purple-500/30 card-glow">
              <CardHeader>
                <CardTitle className="font-orbitron text-purple-300">Все пользователи</CardTitle>
                <CardDescription className="font-inter">
                  Список зарегистрированных игроков
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-400 font-inter">Загрузка...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-inter">Нет пользователей</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/20">
                        <TableHead className="font-orbitron text-purple-300">Игрок</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Steam ID</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Привилегии</TableHead>
                        <TableHead className="font-orbitron text-purple-300">Регистрация</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-purple-500/20">
                          <TableCell className="font-inter">
                            <div className="flex items-center gap-3">
                              {user.steam_avatar && (
                                <img src={user.steam_avatar} alt="" className="w-10 h-10 rounded-full" />
                              )}
                              <span className="text-white">{user.steam_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-gray-400 text-sm">{user.steam_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-purple-400/50 text-purple-300 font-orbitron">
                              {user.privilege_count} активных
                            </Badge>
                          </TableCell>
                          <TableCell className="font-inter text-gray-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString('ru')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone включаем только в Docker-сборке (DOCKER_BUILD=1),
  // чтобы локальный `npm start` работал без предупреждений.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  // Разрешаем заходить на dev-сервер с телефона по локальной сети:
  // иначе Next блокирует клиентские ресурсы/HMR и интерактив не работает.
  allowedDevOrigins: ["172.20.10.11", "172.20.10.*", "192.168.*.*"],
};

export default nextConfig;

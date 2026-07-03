import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone включаем только в Docker-сборке (DOCKER_BUILD=1),
  // чтобы локальный `npm start` работал без предупреждений.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
};

export default nextConfig;

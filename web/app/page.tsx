import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-5xl space-y-4 text-center">
        <h1 className="text-4xl font-bold">工作量管理系统</h1>
        <p className="text-xl text-muted-foreground">欢迎使用工作量管理系统</p>
      </div>
    </main>
  );
}

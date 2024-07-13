'use client'
import { useSession } from "next-auth/react";
import Layout from "./layout";

const Dashboard = () => {
  const session = useSession()
  console.log(session);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4 " >Dashboard Overview</h1>
      <p>Welcome to your dashboard. Here you can see an overview of your activities.</p>
    </Layout>
  );
};

export default Dashboard;

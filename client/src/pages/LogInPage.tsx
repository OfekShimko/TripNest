import Sign from "../components/SignInUp";

const LogInPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Sign inOrUp="in" />
    </div>
  );
};

export default LogInPage;

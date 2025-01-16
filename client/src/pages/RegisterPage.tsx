import Sign from "../components/SignInUp";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Sign inOrUp="up" />
    </div>
  );
};

export default RegisterPage;

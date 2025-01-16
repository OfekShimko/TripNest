import Hero from '../components/Hero.tsx';
import Button from "../components/button.tsx";

const LandingPage = () => {
  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white flex flex-col items-center py-10">
      <Hero />
      <div className="flex gap-4 mt-6">
        <Button massege="Sign in" where="/login" />
        <Button massege="Sign up" where="/register" />
      </div>
    </section>
  );
};

export default LandingPage;

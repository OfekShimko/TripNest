import Hero from '../components/Hero.tsx';
import Button from "../components/button.tsx";

const LandingPage = () => {
    return (

        <section >
            <Hero />
            <Button massege={'Sign in'} where={'/login'} />
            <Button massege={'Sign up'} where={'/register'} />
        </section>

    )
}

export default LandingPage;

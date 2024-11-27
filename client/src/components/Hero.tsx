const Hero = ({
  title = 'TripNest',
  subtitle = 'A cozy space for planning and organizing trips with friends',
  paragraph = 'Discover and plan activities across the world, Create, share, and manage trips alone or with friends',
}) => {
  return (
    <section className='bg-cyan-600 py-20 mb-4'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold text-white sm:text-5xl md:text-6xl'>
            {title}
          </h1>
          <h2 className='my-4 text-xl text-white'>{subtitle}</h2>
          <p className='my-4 text-l text-white'>{paragraph}</p>
        </div>
      </div>
    </section>
  );
};
export default Hero;

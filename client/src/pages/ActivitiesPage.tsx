import ActivityListings from '../components/ActivityListings.tsx';

const ActivitiesPage = () => {
  return (
    <section className='bg-cyan-50 px-4 py-6'>
      <ActivityListings isHome={false}/>
    </section>
  );
};
export default ActivitiesPage;

import { Link } from 'react-router-dom';

const Button = ({ massege, where }: { massege: string; where: string }) => {
  return (
    <section className="m-auto max-w-lg my-10 px-6">
      <Link
        to={where}
        className="block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700"
      >
        {massege}
      </Link>
    </section>
  );
};

export default Button;
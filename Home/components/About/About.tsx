import { FC } from 'react';
import Link from 'next/link';

import { Divider } from 'Base/components/Divider';
import { SocialIcons } from 'Base/components/SocialIcons';

export const About: FC = () => (
  <section id="about" className="flex flex-col gap-4">
    <div>
      <p className="no-margin-top text-white light:text-[#333]">
        Desenvolvedor backend
      </p>
      <p className="no-margin max-w-2xl text-[#b8b2c2] light:text-[#555]">
        Crio coisas com Java e Spring Boot, subo infraestrutura com Terraform e AWS.
        <br />
        Atualmente trabalho no{' '}
        <Link
          href="https://www.linkedin.com/company/itau/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          Itaú Unibanco
        </Link>
        ✌️.
      </p>
    </div>
    <SocialIcons />
    <Divider />
  </section>
);

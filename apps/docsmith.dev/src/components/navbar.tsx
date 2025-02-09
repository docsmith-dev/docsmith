const links = [
  {
    name: "Documentation",
    href: "/docs",
  },
];

export const Navbar = () => {
  return (
    <nav
      className={
        "w-full mx-auto py-4 flex flex-row justify-start items-center"
      }
    >
      <a href={"/"} className={"text-4xl font-display"}>
        Docsmith
      </a>
      <div className={"h-4 w-px bg-gray-200 mx-6"} />
      <ul className={"flex flex-row gap-4"}>
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className={
                "text-1x font-medium font-display text-gray-500 hover:text-gray-900"
              }
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

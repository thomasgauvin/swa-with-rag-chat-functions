"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageWithSlugAndTitle } from "../lib/types";
import { BlogInfo } from "../lib/types";
const wordpressUrl = process.env.WORDPRESS_URL;

export const NavBar = ({
  pages,
  blogInfo,
}: {
  blogInfo: BlogInfo;
  pages: PageWithSlugAndTitle[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-indigo-950  overflow-hidden max-h-screen fixed w-full">
      <header className="container mx-auto flex justify-between align-center max-w-6xl p-4">
        <Link href="/">
          <h1 className="text-2xl text-white font-semibold">{blogInfo.name}</h1>
        </Link>

        <div className="hidden md:block">
          <div className="flex items-center h-full">
            {pages.map((page) => (
              <Link
                href={`/page/${page.slug}`}
                key={page.slug}
                className="text-white text-sm ml-4"
              >
                {page.title.rendered}
              </Link>
            ))}
          </div>
        </div>

        <div className="md:hidden flex">
          <button
            onClick={toggleNavbar}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
      </header>
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } h-screen fixed p-4 bg-slate-700 w-full border-t border-slate-200`}
      >
        <div className="flex flex-col h-full">
          {pages.map((page) => (
            //using an anchor <a> here instead of a <Link> to force refresh & close drawer
            <div className="p-2" key={page.slug}>
              <a
                href={`/page/${page.slug}`}
                key={page.slug}
                className="text-white text-md"
              >
                {page.title.rendered}
              </a>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};
